import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { commitDestinyDraw, getDestinyDayState } from "../lib/destinyStore";

const modeSchema = z.enum(["near", "mid", "far"]);

const deviceIdSchema = z.string().min(16).max(128);

export const destinyRouter = createRouter({
  getStatus: publicQuery
    .input(z.object({ deviceId: deviceIdSchema }))
    .query(({ input }) => {
      return getDestinyDayState(input.deviceId);
    }),

  commitDraw: publicQuery
    .input(
      z.object({
        deviceId: deviceIdSchema,
        mode: modeSchema,
        name: z.string().min(1),
        poem: z.string(),
        dist: z.number(),
      }),
    )
    .mutation(({ input }) => {
      return commitDestinyDraw(input.deviceId, {
        mode: input.mode,
        name: input.name,
        poem: input.poem,
        dist: Math.round(input.dist),
      });
    }),
});
