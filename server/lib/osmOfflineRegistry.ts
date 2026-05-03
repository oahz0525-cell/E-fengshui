import type { OsmDatasetKey, OsmOfflineFile } from "@contracts/osmOffline";
import beijing from "../../contracts/generated/osm/beijing.json";
import newYork from "../../contracts/generated/osm/new-york.json";
import shanghai from "../../contracts/generated/osm/shanghai.json";

/** 构建时生成的离线 POI（OpenStreetMap ODbL），运行时不发起 Overpass */
export const OSM_OFFLINE_BY_DATASET: Record<OsmDatasetKey, OsmOfflineFile> = {
  beijing: beijing as OsmOfflineFile,
  shanghai: shanghai as OsmOfflineFile,
  "new-york": newYork as OsmOfflineFile,
};
