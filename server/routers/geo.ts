import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import type { Element } from "@contracts/fengshui";
import { fetchCityInfoServer } from "../lib/nominatim";
import { fetchNearbySpotServer } from "../lib/nearbySpot";
import type { DestinyMode } from "../lib/wikiPlaces";

const ELEMENT_SET = new Set(["木", "火", "土", "金", "水"]);

const elementSchema = z.enum(["木", "火", "土", "金", "水"]);
const modeSchema = z.enum(["near", "mid", "far"]).nullable();

/** 客户端 superjson / 状态偶发混入非字符串时，避免整段 input 校验失败 */
function sanitizeXiInput(val: unknown): Element[] | undefined {
  if (!Array.isArray(val)) return undefined;
  const out = val.filter((x): x is Element => typeof x === "string" && ELEMENT_SET.has(x as Element));
  return out.length ? out : undefined;
}

export const geoRouter = createRouter({
  cityInfo: publicQuery
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
    )
    .query(async ({ input }) => {
      return fetchCityInfoServer(input.lat, input.lng);
    }),

  nearbySpot: publicQuery
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        element: z.preprocess(
          (v) => (typeof v === "string" ? v.trim() : v),
          elementSchema,
        ),
        wikiLang: z.preprocess(
          (v) => (typeof v === "string" && v.trim() ? v.trim() : "US"),
          z.string(),
        ),
        mode: modeSchema,
        seed: z.number().int(),
        /** 每次抽签递增，避免「换一个」仍落到同一 POI */
        rollId: z.number().int().default(0),
        /** 今日已抽过的地点名，换签时排除重复 */
        excludeNames: z.array(z.string().max(200)).max(50).optional().default([]),
        /** 喜用神五行 — 预制库兜底时优先匹配景点 `el` */
        xi: z.preprocess(sanitizeXiInput, z.array(elementSchema).optional()),
      }),
    )
    .mutation(async ({ input }) => {
      const spot = await fetchNearbySpotServer(
        input.lat,
        input.lng,
        input.element as Element,
        input.wikiLang,
        input.mode as DestinyMode | null,
        input.seed,
        input.rollId,
        input.excludeNames ?? [],
        input.xi as Element[] | undefined,
      );
      return { spot };
    }),
});
