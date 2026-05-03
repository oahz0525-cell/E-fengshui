import type { Element } from "@contracts/fengshui";
import { fetchGaodeSpotsServer } from "./gaodePlaces";
import { isRoughlyMainlandChina } from "./geoBounds";
import { fetchOverpassSpotServer } from "./overpassPlaces";
import { pickPresetCitySpot } from "./presetCitySpots";
import { fetchWikiSpotsServer, type DestinyMode } from "./wikiPlaces";
import type { SpotResult } from "./spotResult";

/**
 * 顺序：① 预制城市（手写 + 内置 OSM JSON，无外网）② 国内高德 ③ 维基 ④ Overpass。
 * 在有离线数据集的城市优先本地抽签，避免外网超时 / 504。
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
  const offline = pickPresetCitySpot(lat, lng, element, xi ?? null, mode, seed, rollId, excludeNames);
  if (offline) return offline;

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
  return null;
}
