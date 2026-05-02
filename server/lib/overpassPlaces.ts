import { fetchWithTimeout, EXTERNAL_FETCH_MS } from "./fetchTimeout";
import { haversine } from "./geo";
import { hash } from "./hash";
import type { DestinyMode } from "./wikiPlaces";
import { filterExcluded } from "./spotExclude";
import type { SpotResult } from "./spotResult";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function filterByMode(places: SpotResult[], mode: DestinyMode | null): SpotResult[] {
  if (!mode) return places;
  if (mode === "near") return places.filter((p) => (p.dist || 0) <= 1200);
  if (mode === "mid") return places.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
  if (mode === "far") return places.filter((p) => (p.dist || 0) > 5500);
  return places;
}

function inferOsmType(tags: Record<string, string>): string {
  const amenity = (tags.amenity || "").toLowerCase();
  if (/library|cafe|museum|arts_centre|theatre|community_centre/.test(amenity))
    return amenity.includes("cafe") ? "urban" : "monument";
  const t = `${tags.tourism || ""} ${tags.leisure || ""} ${tags.historic || ""} ${tags.natural || ""}`.toLowerCase();
  if (/park|garden|forest|nature_reserve/.test(t)) return "park";
  if (/water|beach|spring/.test(t)) return "water";
  if (/view|peak|attraction/.test(t)) return "viewpoint";
  if (/monument|castle|ruins|memorial|wayside_shrine|place_of_worship/.test(t)) return "monument";
  return "default";
}

function buildOverpassQuery(lat: number, lng: number, radius: number): string {
  return `
[out:json][timeout:12];
(
  nwr["tourism"](around:${radius},${lat},${lng});
  nwr["leisure"~"park|garden|nature_reserve|pitch"](around:${radius},${lat},${lng});
  nwr["historic"](around:${radius},${lat},${lng});
  nwr["natural"](around:${radius},${lat},${lng});
  nwr["amenity"~"library|cafe|museum|arts_centre|community_centre|place_of_worship|theatre"](around:${radius},${lat},${lng});
);
out tags center 150;
`.trim();
}

function mapOverpassElements(
  lat0: number,
  lng0: number,
  data: {
    elements?: {
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }[];
  },
): SpotResult[] {
  const elements = data.elements || [];
  const mapped: SpotResult[] = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"] || tags["name:zh"];
    if (!name) continue;
    const plat = el.lat ?? el.center?.lat;
    const plng = el.lon ?? el.center?.lon;
    if (plat == null || plng == null) continue;
    const distM = Math.round(haversine(lat0, lng0, plat, plng) * 1000);
    mapped.push({
      name,
      lat: plat,
      lng: plng,
      dist: distM,
      type: inferOsmType(tags),
    });
  }
  return mapped;
}

async function fetchOverpassEndpoint(
  endpoint: string,
  lat0: number,
  lng0: number,
  query: string,
): Promise<SpotResult[] | null> {
  try {
    const res = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ElectronicFengshui/1.0 (route-a-osm)",
        },
        body: `data=${encodeURIComponent(query)}`,
      },
      EXTERNAL_FETCH_MS,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      elements?: {
        type: string;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }[];
    };
    const mapped = mapOverpassElements(lat0, lng0, data);
    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
  }
}

/** 两个 Overpass 镜像并行请求，谁先返回有效 POI 用谁 */
async function runOverpass(lat0: number, lng0: number, query: string): Promise<SpotResult[] | null> {
  const results = await Promise.all(
    OVERPASS_ENDPOINTS.map((endpoint) => fetchOverpassEndpoint(endpoint, lat0, lng0, query)),
  );
  for (const r of results) {
    if (r && r.length > 0) return r;
  }
  return null;
}

/** OpenStreetMap Overpass — 路线 A 主力 POI 源（无 Key） */
export async function fetchOverpassSpotServer(
  lat0: number,
  lng0: number,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[] = [],
): Promise<SpotResult | null> {
  const radii = [18000, 28000] as const;
  const queries = radii.map((radius) => buildOverpassQuery(lat0, lng0, radius));
  const mappedList = await Promise.all(
    queries.map((query) => runOverpass(lat0, lng0, query)),
  );

  for (let i = 0; i < radii.length; i++) {
    const radius = radii[i];
    const mapped = mappedList[i];
    if (!mapped || mapped.length === 0) continue;

    let pool = filterExcluded(filterByMode(mapped, mode), excludeNames);
    let fallback = false;
    if (pool.length === 0) {
      pool = filterExcluded(mapped, excludeNames);
      fallback = true;
    }
    if (pool.length === 0) continue;

    const h = hash(
      `${lat0.toFixed(3)},${lng0.toFixed(3)},${seed},${mode || "x"},r${rollId},overpass,${radius}`,
    );
    const pick = pool[h % pool.length];
    return pick ? { ...pick, fallback } : null;
  }
  return null;
}
