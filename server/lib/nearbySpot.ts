import type { Element } from "@contracts/fengshui";
import { fetchGaodeSpotsServer } from "./gaodePlaces";
import { isRoughlyMainlandChina } from "./geoBounds";
import { fetchOverpassSpotServer } from "./overpassPlaces";
import { pickPresetCitySpot } from "./presetCitySpots";
import { fetchWikiSpotsServer, type DestinyMode } from "./wikiPlaces";
import type { SpotResult } from "./spotResult";

/**
 * 路线 A：国内高德（可选 Key）→ 维基地理词条 → OSM Overpass。
 * 三路外网 IO 并行发起，按优先级选用结果，避免串行累加超时。
 */
export async function fetchNearbySpotServer(
  lat: number,
  lng: number,
  element: Element,
  wikiLang: string,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[] = [],
  xi?: Element[] | null,
): Promise<SpotResult | null> {
  const wikiLangNorm = wikiLang?.trim() || "US";
  const mainland = isRoughlyMainlandChina(lat, lng);

  const gaodeP = mainland
    ? fetchGaodeSpotsServer(lat, lng, element, seed, mode, rollId, excludeNames)
    : Promise.resolve(null as SpotResult | null);
  const wikiP = fetchWikiSpotsServer(lat, lng, wikiLangNorm, mode, seed, rollId, excludeNames);
  const overpassP = fetchOverpassSpotServer(lat, lng, mode, seed, rollId, excludeNames);

  const [gaode, wiki, overpass] = await Promise.all([gaodeP, wikiP, overpassP]);

  if (mainland && gaode) return gaode;
  if (wiki) return wiki;
  if (overpass) return overpass;
  return pickPresetCitySpot(lat, lng, element, xi ?? null, mode, seed, rollId, excludeNames);
}
