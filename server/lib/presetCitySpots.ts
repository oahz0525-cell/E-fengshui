import type { Element } from "@contracts/fengshui";
import { PRESET_CITIES } from "@contracts/presetCities";
import { haversine } from "./geo";
import { hash } from "./hash";
import type { DestinyMode } from "./wikiPlaces";
import { filterExcluded } from "./spotExclude";
import type { SpotResult } from "./spotResult";

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

function filterByMode(places: SpotResult[], mode: DestinyMode | null): SpotResult[] {
  if (!mode) return places;
  if (mode === "near") return places.filter((p) => (p.dist || 0) <= 1200);
  if (mode === "mid") return places.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
  if (mode === "far") return places.filter((p) => (p.dist || 0) > 5500);
  return places;
}

/**
 * 在线高德 / 维基 / Overpass 均无结果时：若用户落在预制城市半径内，
 * 按喜用神 `xi`（若有）筛景点五行，再按寻地之距与哈希抽签。
 */
export function pickPresetCitySpot(
  lat: number,
  lng: number,
  dayMasterEl: Element,
  xi: Element[] | null | undefined,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[],
): SpotResult | null {
  const xiSet = xi?.length ? new Set(xi) : null;

  for (const city of PRESET_CITIES) {
    const distToCenterKm = haversine(lat, lng, city.lat, city.lng);
    if (distToCenterKm > city.radius) continue;

    let mapped: SpotResult[] = city.spots.map((s) => {
      const distM = Math.round(haversine(lat, lng, s.lat, s.lng) * 1000);
      return {
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        dist: distM,
        type: typeFromElement(s.el),
      };
    });

    if (xiSet) {
      const byXi = mapped.filter((p) => {
        const spot = city.spots.find((x) => x.name === p.name);
        return spot && xiSet.has(spot.el);
      });
      if (byXi.length > 0) mapped = byXi;
      else {
        const byDay = mapped.filter((p) => {
          const spot = city.spots.find((x) => x.name === p.name);
          return spot && spot.el === dayMasterEl;
        });
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

    const h = hash(
      `${lat.toFixed(4)},${lng.toFixed(4)},${new Date().getDate()},${seed},${mode || "preset"},r${rollId},${city.name}`,
    );
    const pick = pool[h % pool.length];
    if (pick) return { ...pick, fallback };
  }

  return null;
}
