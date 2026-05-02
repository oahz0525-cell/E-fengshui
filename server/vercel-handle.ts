import { handle } from "hono/vercel";
import app from "./boot";

/**
 * Next.js App Router 以外的部署：同时依赖根目录 `vercel.json` →
 * `functions["api/trpc/[...path].js"].maxDuration`（当前 60s）。
 */
export const maxDuration = 60;

/** Bundled for Vercel `api/[[...path]].js` — avoids Vercel typechecking all of `server/` with nodenext. */
export default handle(app);
