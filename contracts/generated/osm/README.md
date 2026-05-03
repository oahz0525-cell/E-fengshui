# 离线 OSM 景点数据（构建生成）

- `beijing.json` / `shanghai.json`：由 Geofabrik 市级 `.osm.pbf` 解析生成（见 `scripts/build-osm-pois.ts`）。
- `new-york.json`：由 Overpass API 对纽约都会 bbox 的一次性导出生成（避免下载整州数百 MB PBF）。

更新数据：

```bash
npm run data:osm
```

仅重建纽约（Overpass 繁忙时可单独重试）：

```bash
npm run data:osm -- --nyc-only
```

缓存的 `.pbf` 位于 `scripts/cache/osm/`（已 `.gitignore`）。构建脚本需联网。

授权：ODbL — 应用界面建议保留对 OpenStreetMap 的署名（见 `ATTRIBUTION.txt`）。
