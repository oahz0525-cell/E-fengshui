import type { Element } from "./fengshui";
import type { OsmDatasetKey, OsmOfflinePoi } from "./osmOffline";
import type { PresetCity, PresetCitySpot } from "./presetCities";
import { haversineKm, hashString } from "./geoMath";

export type PresetDistMode = "near" | "mid" | "far" | null;

export interface PickSpotResult {
  name: string;
  lat: number;
  lng: number;
  type: string;
  dist: number;
  fallback?: boolean;
}

function normalizeSpotName(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function typeFromElement(el: Element): string {
  const m: Record<Element, string> = {
    木: "park",
    水: "water",
    火: "viewpoint",
    土: "urban",
    金: "monument",
  };
  return m[el] ?? "default";
}

function filterByMode<T extends PickSpotResult>(places: T[], mode: PresetDistMode): T[] {
  if (!mode) return places;
  if (mode === "near") return places.filter((p) => (p.dist || 0) <= 1200);
  if (mode === "mid") return places.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
  if (mode === "far") return places.filter((p) => (p.dist || 0) > 5500);
  return places;
}

function filterExcluded<T extends PickSpotResult>(places: T[], excludeNames: string[]): T[] {
  if (!excludeNames.length) return places;
  const set = new Set(excludeNames.map(normalizeSpotName).filter(Boolean));
  return places.filter((p) => !set.has(normalizeSpotName(p.name)));
}

/**
 * 纯函数：不依赖网络。服务端可注入 `osmPoisByDataset` 合并 OSM 离线包；浏览器在 API 失败时只传预制城市与手写景点。
 * 喜用神筛选用每条候选上的 `el`（含 OSM 导出的五行），与仅查 `city.spots` 相比不会漏掉离线 OSM 点。
 */
export function pickPresetCitySpotCore(
  lat: number,
  lng: number,
  dayMasterEl: Element,
  xi: Element[] | null | undefined,
  mode: PresetDistMode,
  seed: number,
  rollId: number,
  excludeNames: string[],
  cities: PresetCity[],
  osmPoisByDataset?: Partial<Record<OsmDatasetKey, OsmOfflinePoi[]>>,
): PickSpotResult | null {
  const xiSet = xi?.length ? new Set(xi) : null;

  for (const city of cities) {
    const distToCenterKm = haversineKm(lat, lng, city.lat, city.lng);
    if (distToCenterKm > city.radius) continue;

    type Row = PickSpotResult & { el: Element };
    let rows: Row[] = city.spots.map((s: PresetCitySpot) => {
      const distM = Math.round(haversineKm(lat, lng, s.lat, s.lng) * 1000);
      return {
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        dist: distM,
        type: typeFromElement(s.el),
        el: s.el,
      };
    });

    const osmList =
      city.osmDataset && osmPoisByDataset?.[city.osmDataset]?.length
        ? osmPoisByDataset[city.osmDataset]!
        : undefined;
    if (osmList?.length) {
      const seen = new Set(rows.map((r) => normalizeSpotName(r.name)));
      for (const p of osmList) {
        const k = normalizeSpotName(p.name);
        if (seen.has(k)) continue;
        seen.add(k);
        rows.push({
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          dist: Math.round(haversineKm(lat, lng, p.lat, p.lng) * 1000),
          type: typeFromElement(p.el),
          el: p.el,
        });
      }
    }

    let mapped: Row[] = rows;
    if (xiSet) {
      const byXi = rows.filter((r) => xiSet.has(r.el));
      if (byXi.length > 0) mapped = byXi;
      else {
        const byDay = rows.filter((r) => r.el === dayMasterEl);
        if (byDay.length > 0) mapped = byDay;
      }
    }

    let pool = filterExcluded(filterByMode(mapped, mode), excludeNames);
    let fallback = false;
    if (pool.length === 0) {
      pool = filterExcluded(mapped, excludeNames);
      fallback = true;
    }
    if (pool.length === 0) continue;

    const h = hashString(
      `${lat.toFixed(4)},${lng.toFixed(4)},${new Date().getDate()},${seed},${mode || "preset"},r${rollId},${city.name}`,
    );
    const pick = pool[h % pool.length] as Row | undefined;
    if (!pick) continue;
    return {
      name: pick.name,
      lat: pick.lat,
      lng: pick.lng,
      dist: pick.dist,
      type: pick.type,
      fallback,
    };
  }

  return null;
}
