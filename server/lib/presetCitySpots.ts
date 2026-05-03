import type { Element } from "@contracts/fengshui";
import { PRESET_CITIES } from "@contracts/presetCities";
import { pickPresetCitySpotCore } from "@contracts/pickPresetSpotCore";
import { OSM_OFFLINE_BY_DATASET } from "./osmOfflineRegistry";
import type { DestinyMode } from "./wikiPlaces";
import type { SpotResult } from "./spotResult";

/**
 * 预制城市抽签：手写景点 + 服务端内置 OSM JSON（contracts/generated/osm）。
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
  return pickPresetCitySpotCore(
    lat,
    lng,
    dayMasterEl,
    xi,
    mode,
    seed,
    rollId,
    excludeNames,
    PRESET_CITIES,
    {
      beijing: OSM_OFFLINE_BY_DATASET.beijing.pois,
      shanghai: OSM_OFFLINE_BY_DATASET.shanghai.pois,
      "new-york": OSM_OFFLINE_BY_DATASET["new-york"].pois,
    },
  );
}
