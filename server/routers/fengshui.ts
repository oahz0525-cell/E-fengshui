import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { calcBazi } from "../engine/bazi";
import { genEnv, divineWeather, calcResult } from "../engine/scorer";
import { XI_SHEN, stemToElement, GOALS, WEATHER } from "../engine/data";
import type { Goal } from "@contracts/fengshui";
import { fetchOpenMeteoSummary } from "../lib/openMeteo";

export const fengshuiRouter = createRouter({
  // 八字排盘
  bazi: publicQuery
    .input(z.object({
      year: z.number().min(1925).max(2026),
      month: z.number().min(1).max(12),
      day: z.number().min(1).max(31),
      hour: z.number().min(0).max(23),
    }))
    .query(({ input }) => {
      return calcBazi(input.year, input.month, input.day, input.hour);
    }),

  // 风水计算（核心API）
  calculate: publicQuery
    .input(z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      floor: z.number().min(1).max(99).default(1),
      stem: z.string().min(1),
      goal: z.string(),
    }))
    .query(({ input }) => {
      const el = stemToElement(input.stem);
      const xi = XI_SHEN[el];
      const goal = input.goal as Goal;

      const env = genEnv(input.lat, input.lng, input.floor);
      const result = calcResult(el, goal, env, xi);

      return {
        ...result,
        element: el,
        stem: input.stem,
        goal: GOALS[goal] ?? goal,
        goalKey: goal,
        xiShen: xi,
        bestDir: result.dir,
        scoreComment: result.comment,
      };
    }),

  // 天气模拟
  weather: publicQuery
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
    }))
    .query(({ input }) => {
      const cond = divineWeather(input.lat, input.lng);
      return WEATHER[cond] ?? WEATHER.clear;
    }),

  /** Open-Meteo 实况与短期预报（路线 A，无 Key）——供开运指南 / 明日预言引用 */
  forecast: publicQuery
    .input(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
    .query(async ({ input }) => {
      const summary = await fetchOpenMeteoSummary(input.lat, input.lng);
      return {
        summary: summary ?? "",
        source: summary ? ("open-meteo" as const) : ("none" as const),
      };
    }),
});
