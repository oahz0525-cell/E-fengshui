import type { Element } from "@contracts/fengshui";
import { env } from "./env";
import { fetchWithTimeout, EXTERNAL_FETCH_MS } from "./fetchTimeout";
import { haversine } from "./geo";
import { hash } from "./hash";
import { GAODE_TYPES } from "./placesData";
import { filterExcluded, normalizeSpotName } from "./spotExclude";
import type { SpotResult } from "./spotResult";

export type DestinyMode = "near" | "mid" | "far";

function inferGaodeType(typeStr: string): string {
  if (!typeStr) return "default";
  if (/公园|风景名胜|植物园|森林/.test(typeStr)) return "park";
  if (/水系|河流|湖泊|海滩|喷泉/.test(typeStr)) return "water";
  if (/广场|体育|游乐|娱乐/.test(typeStr)) return "viewpoint";
  if (/博物馆|古迹|寺庙|教堂|纪念|文物/.test(typeStr)) return "monument";
  if (/餐饮|咖啡|书店|购物|写字楼/.test(typeStr)) return "urban";
  return "default";
}

function filterByMode(places: SpotResult[], mode: DestinyMode | null): SpotResult[] {
  if (!mode) return places;
  if (mode === "near") return places.filter((p) => (p.dist || 0) <= 1200);
  if (mode === "mid") return places.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
  if (mode === "far") return places.filter((p) => (p.dist || 0) > 5500);
  return places;
}

async function fetchGaodePage(
  lat: number,
  lng: number,
  element: Element,
  page: number,
): Promise<SpotResult[]> {
  const apiKey = env.gaodeKey;
  if (!apiKey) return [];

  const types = GAODE_TYPES[element] || "110100|110000";
  const url = new URL("https://restapi.amap.com/v3/place/around");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("location", `${lng.toFixed(6)},${lat.toFixed(6)}`);
  url.searchParams.set("radius", "25000");
  url.searchParams.set("types", types);
  url.searchParams.set("offset", "25");
  url.searchParams.set("page", String(page));
  url.searchParams.set("output", "JSON");

  const res = await fetchWithTimeout(url.toString(), undefined, EXTERNAL_FETCH_MS);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    status?: string;
    pois?: { name: string; location: string; distance?: string; type?: string }[];
  };
  if (data.status !== "1" || !data.pois?.length) return [];

  return data.pois
    .filter((p) => p.name && p.location)
    .map((p) => {
      const [plng, plat] = p.location.split(",").map(Number);
      const distM =
        parseFloat(String(p.distance || "")) ||
        haversine(lat, lng, plat, plng) * 1000;
      return {
        name: p.name,
        lat: plat,
        lng: plng,
        dist: Math.round(distM),
        type: inferGaodeType(p.type || ""),
      };
    });
}

export async function fetchGaodeSpotsServer(
  lat: number,
  lng: number,
  element: Element,
  seed: number,
  mode: DestinyMode | null,
  rollId: number,
  excludeNames: string[] = [],
): Promise<SpotResult | null> {
  if (!env.gaodeKey) return null;

  try {
    const merged: SpotResult[] = [];
    const seen = new Set<string>();

    const pageChunks = await Promise.all([
      fetchGaodePage(lat, lng, element, 1),
      fetchGaodePage(lat, lng, element, 2),
      fetchGaodePage(lat, lng, element, 3),
    ]);
    let pageIdx = 0;
    for (const chunk of pageChunks) {
      pageIdx += 1;
      if (!chunk.length) continue;
      for (const p of chunk) {
        const k = normalizeSpotName(p.name);
        if (seen.has(k)) continue;
        seen.add(k);
        merged.push(p);
      }

      let pool = filterExcluded(filterByMode(merged, mode), excludeNames);
      let fallback = false;
      if (pool.length === 0) {
        pool = filterExcluded(merged, excludeNames);
        if (pool.length > 0) fallback = true;
      }
      if (pool.length === 0) continue;

      const h = hash(
        `${lat.toFixed(4)},${lng.toFixed(4)},${new Date().getDate()},${seed},${mode || "any"},r${rollId},p${pageIdx}`,
      );
      const pick = pool[h % pool.length];
      if (pick) return { ...pick, fallback };
    }
    return null;
  } catch {
    return null;
  }
}
