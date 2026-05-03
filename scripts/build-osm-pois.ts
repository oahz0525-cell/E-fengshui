/**
 * 从 Geofabrik .osm.pbf（北京/上海）或一次性 Overpass 导出（纽约核心区）生成
 * contracts/generated/osm/*.json，供服务端抽签离线检索，运行时不再请求 Overpass。
 *
 * 使用：npm run data:osm
 * 许可：OpenStreetMap ODbL — 分发时需保留署名（见 generated/osm/ATTRIBUTION.txt）
 */
import { mkdirSync, existsSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createOSMStream } from "osm-pbf-parser-node";
import type { Element } from "../contracts/fengshui.ts";
import type { OsmOfflineFile, OsmOfflinePoi } from "../contracts/osmOffline.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "contracts/generated/osm");
const CACHE_DIR = join(__dirname, "cache/osm");

const MAX_POIS = 2500;

const SOURCES = {
  beijing: {
    url: "https://download.geofabrik.de/asia/china/beijing-latest.osm.pbf",
    filename: "beijing-latest.osm.pbf",
    bbox: null as null | { south: number; west: number; north: number; east: number },
    source: "geofabrik-pbf" as const,
  },
  shanghai: {
    url: "https://download.geofabrik.de/asia/china/shanghai-latest.osm.pbf",
    filename: "shanghai-latest.osm.pbf",
    bbox: null,
    source: "geofabrik-pbf" as const,
  },
} as const;

/** 纽约：避免下载整州 ~467MB PBF，构建时用 Overpass 一次性拉取bbox内要素（仅构建机联网） */
const NYC_BBOX = { south: 40.49, west: -74.26, north: 40.92, east: -73.7 };

function normalizeName(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function inferElementFromOsmTags(tags: Record<string, string>): Element {
  const blob = [tags.natural, tags.leisure, tags.tourism, tags.amenity, tags.historic, tags.landuse, tags.waterway]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\b(park|forest|garden|wood|tree|grass|national_park)\b/.test(blob)) return "木";
  if (/\b(water|beach|bay|spring|river|fountain|lake|sea|ocean|coastline)\b/.test(blob)) return "水";
  if (/\b(museum|monument|church|temple|historic|memorial|ruins|castle|archaeological)\b/.test(blob)) return "金";
  if (/\b(view|peak|attraction|tower|observatory|theme_park)\b/.test(blob)) return "火";
  return "土";
}

function isCandidatePoi(tags: Record<string, string>): boolean {
  const name = tags.name?.trim();
  if (!name || name.length < 2) return false;
  if (tags.highway && !tags.tourism && !tags.historic && !tags.leisure) return false;
  return !!(tags.tourism || tags.historic || tags.leisure || tags.amenity || tags.natural);
}

function inBbox(lat: number, lng: number, b: { south: number; west: number; north: number; east: number }): boolean {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

async function ensureDownload(url: string, destPath: string): Promise<void> {
  mkdirSync(dirname(destPath), { recursive: true });
  if (existsSync(destPath)) {
    const st = statSync(destPath);
    if (st.size > 1_000_000) {
      console.log(`Using cached ${destPath} (${(st.size / 1e6).toFixed(1)} MB)`);
      return;
    }
  }
  console.log(`Downloading ${url} …`);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  console.log(`Saved ${destPath} (${(buf.length / 1e6).toFixed(1)} MB)`);
}

async function extractPbf(path: string, bbox: typeof NYC_BBOX | null): Promise<OsmOfflinePoi[]> {
  const out: OsmOfflinePoi[] = [];
  const seen = new Set<string>();

  for await (const item of createOSMStream(path, { withTags: true, withInfo: false })) {
    const anyItem = item as { type?: string; lat?: number; lon?: number; tags?: Record<string, string>; bbox?: unknown };
    if (anyItem.bbox) continue;
    if (anyItem.type !== "node" || anyItem.lat == null || anyItem.lon == null) continue;
    const tags = anyItem.tags || {};
    if (!isCandidatePoi(tags)) continue;
    if (bbox && !inBbox(anyItem.lat, anyItem.lon, bbox)) continue;

    const name = normalizeName(tags.name!);
    const dedupeKey = `${name}|${anyItem.lat.toFixed(4)}|${anyItem.lon.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    out.push({
      name,
      lat: anyItem.lat,
      lng: anyItem.lon,
      el: inferElementFromOsmTags(tags),
    });
    if (out.length >= MAX_POIS) break;
  }

  return out;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function buildNewYorkOverpass(): Promise<OsmOfflinePoi[]> {
  const { south, west, north, east } = NYC_BBOX;
  /** 略减轻负载：略降 max 元素；仍覆盖主要景点 */
  const query = `
[out:json][timeout:240];
(
  nwr["tourism"](${south},${west},${north},${east});
  nwr["leisure"~"park|garden|nature_reserve"](${south},${west},${north},${east});
  nwr["historic"](${south},${west},${north},${east});
  nwr["natural"](${south},${west},${north},${east});
  nwr["amenity"~"library|cafe|museum|arts_centre|community_centre|place_of_worship|theatre"](${south},${west},${north},${east});
);
out tags center 12000;
`.trim();

  console.log("Fetching NYC metro via Overpass (one-time build export) …");
  let res: Response | null = null;
  let lastErr: unknown;
  outer: for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 300_000);
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "ElectronicFengshui/osm-build-script",
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });
        clearTimeout(to);
        if (res.ok) break outer;
        if (res.status === 504 || res.status === 429) {
          console.warn(`Overpass ${res.status} from ${attempt + 1}/3 @ ${endpoint}, retry…`);
          await sleep(8000 * (attempt + 1));
          continue;
        }
        throw new Error(`Overpass ${res.status}`);
      } catch (e) {
        clearTimeout(to);
        lastErr = e;
        if (attempt < 2) await sleep(6000 * (attempt + 1));
      }
    }
  }
  if (!res?.ok) throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? "Overpass failed"));

  const data = (await res.json()) as {
      elements?: {
        type: string;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }[];
    };
    const elements = data.elements || [];
    const pois: OsmOfflinePoi[] = [];
    const seen = new Set<string>();

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags["name:en"] || tags["name:zh"];
      if (!name?.trim()) continue;
      if (!isCandidatePoi({ ...tags, name })) continue;
      const plat = el.lat ?? el.center?.lat;
      const plng = el.lon ?? el.center?.lon;
      if (plat == null || plng == null) continue;
      if (!inBbox(plat, plng, NYC_BBOX)) continue;

      const n = normalizeName(name);
      const dedupeKey = `${n}|${plat.toFixed(4)}|${plng.toFixed(4)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      pois.push({
        name: n,
        lat: plat,
        lng: plng,
        el: inferElementFromOsmTags(tags),
      });
      if (pois.length >= MAX_POIS) break;
    }

  console.log(`NYC Overpass → ${pois.length} POIs`);
  return pois;
}

async function writeJson(filename: string, body: OsmOfflineFile): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const p = join(OUT_DIR, filename);
  await writeFile(p, JSON.stringify(body) + "\n", "utf8");
  console.log(`Wrote ${p} (${body.pois.length} pois)`);
}

async function main(): Promise<void> {
  mkdirSync(CACHE_DIR, { recursive: true });
  const nycOnly = process.argv.includes("--nyc-only");

  if (!nycOnly) {
  // Beijing
  const bjPath = join(CACHE_DIR, SOURCES.beijing.filename);
  await ensureDownload(SOURCES.beijing.url, bjPath);
  const bjPois = await extractPbf(bjPath, SOURCES.beijing.bbox);
  await writeJson("beijing.json", {
    extractedAt: new Date().toISOString(),
    source: "geofabrik-pbf",
    sourceUrl: SOURCES.beijing.url,
    license: "ODbL",
    pois: bjPois,
  });

  // Shanghai
  const shPath = join(CACHE_DIR, SOURCES.shanghai.filename);
  await ensureDownload(SOURCES.shanghai.url, shPath);
  const shPois = await extractPbf(shPath, SOURCES.shanghai.bbox);
  await writeJson("shanghai.json", {
    extractedAt: new Date().toISOString(),
    source: "geofabrik-pbf",
    sourceUrl: SOURCES.shanghai.url,
    license: "ODbL",
    pois: shPois,
  });
  }

  // New York (Overpass bbox export)
  const nyPois = await buildNewYorkOverpass();
  await writeJson("new-york.json", {
    extractedAt: new Date().toISOString(),
    source: "overpass-build",
    sourceUrl: `Overpass bbox NYC (${NYC_BBOX.south},${NYC_BBOX.west},${NYC_BBOX.north},${NYC_BBOX.east})`,
    license: "ODbL",
    pois: nyPois,
  });

  console.log("\nDone. OSM offline datasets updated under contracts/generated/osm/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
