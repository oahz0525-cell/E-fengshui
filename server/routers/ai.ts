import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { generateFunAdviceLines, generateProphecyBlock, generateSpotPoemText } from "../lib/kimi";

export const aiRouter = createRouter({
  funAdvice: publicQuery
    .input(
      z.object({
        el: z.string(),
        xi: z.array(z.string()),
        goal: z.string(),
        weather: z.string(),
        lat: z.number(),
        lng: z.number(),
        stem: z.string().optional(),
        floor: z.number().optional(),
        goalKey: z.string().optional(),
        cityHint: z.string().optional(),
        forecastDetail: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const r = await generateFunAdviceLines(
        input.el,
        input.xi,
        input.goal,
        input.weather,
        `${input.lat.toFixed(2)},${input.lng.toFixed(2)}`,
        {
          stem: input.stem,
          floor: input.floor,
          goalKey: input.goalKey,
          cityHint: input.cityHint,
          forecastDetail: input.forecastDetail,
        },
      );
      return { lines: r.lines, provider: r.provider };
    }),

  spotPoem: publicQuery
    .input(
      z.object({
        spotName: z.string(),
        dist: z.number(),
        xi: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const r = await generateSpotPoemText(input.spotName, input.dist, input.xi);
      return { poem: r.poem, provider: r.provider };
    }),

  prophecy: publicQuery
    .input(
      z.object({
        xi: z.array(z.string()),
        lat: z.number(),
        lng: z.number(),
        stem: z.string().optional(),
        floor: z.number().optional(),
        goalKey: z.string().optional(),
        cityHint: z.string().optional(),
        forecastDetail: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const r = await generateProphecyBlock(input.xi, input.lat, input.lng, {
        stem: input.stem,
        floor: input.floor,
        goalKey: input.goalKey,
        cityHint: input.cityHint,
        forecastDetail: input.forecastDetail,
      });
      return { block: r.block, provider: r.provider };
    }),
});
