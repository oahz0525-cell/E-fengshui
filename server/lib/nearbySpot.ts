import type { Element } from "@contracts/fengshui";
import { fetchGaodeSpotsServer } from "./gaodePlaces";
import { isRoughlyMainlandChina } from "./geoBounds";
import { fetchOverpassSpotServer } from "./overpassPlaces";
import { fetchWikiSpotsServer, type DestinyMode } from "./wikiPlaces";
import type { SpotResult } from "./spotResult";

/** 路线 A：国内高德（可选 Key）→ 维基地理词条 → OSM Overpass；不使用付费地图 API、不含虚构地名兜底 */
export async function fetchNearbySpotServer(
  lat: number,
  lng: number,
  element: Element,
  wikiLang: string,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[] = [],
): Promise<SpotResult | null> {
  if (isRoughlyMainlandChina(lat, lng)) {
    const gaode = await fetchGaodeSpotsServer(lat, lng, element, seed, mode, rollId, excludeNames);
    if (gaode) return gaode;
  }
  const wikiLangNorm = wikiLang?.trim() || "US";
  const wiki = await fetchWikiSpotsServer(lat, lng, wikiLangNorm, mode, seed, rollId, excludeNames);
  if (wiki) return wiki;
  return fetchOverpassSpotServer(lat, lng, mode, seed, rollId, excludeNames);
}
