/** 提交/进入结果页后，等待云端 bundle 的最长时间；逾时改用浏览器本地推算（与引擎同源逻辑） */
export const RESULT_PAGE_API_STALL_MS = 3_000;

/** 寻地密语：等待 geo.nearbySpot 连接/响应的上限，逾时改用内置预制城市抽签 */
export const NEARBY_SPOT_API_CONNECT_MS = 3_000;

/** 寻地密语：从点击「抽签」到必须展示出地点+诗句的总时长上限 */
export const DESTINY_DRAW_TOTAL_MS = 5_000;
