import { createRouter, publicQuery } from "./middleware";
import { fengshuiRouter } from "./routers/fengshui";
import { aiRouter } from "./routers/ai";
import { geoRouter } from "./routers/geo";
import { destinyRouter } from "./routers/destiny";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  fengshui: fengshuiRouter,
  ai: aiRouter,
  geo: geoRouter,
  destiny: destinyRouter,
});

export type AppRouter = typeof appRouter;
