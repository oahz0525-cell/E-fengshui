import type { Element } from "./fengshui";

/** 与 `contracts/generated/osm/*.json` 的 `DatasetKey` 对齐 */
export type OsmDatasetKey = "beijing" | "shanghai" | "new-york";

export interface OsmOfflinePoi {
  name: string;
  lat: number;
  lng: number;
  el: Element;
}

export interface OsmOfflineFile {
  extractedAt: string;
  /** 构建数据来源说明 */
  source: "geofabrik-pbf" | "overpass-build";
  sourceUrl: string;
  /** OpenStreetMap ODbL */
  license: "ODbL";
  pois: OsmOfflinePoi[];
}
