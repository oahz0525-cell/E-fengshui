import { handle } from "hono/vercel";
import app from "./boot";

/**
 * Next.js App Router 以外的部署：同时依赖根目录 `vercel.json` →
 * `functions["api/trpc/[...path].js"].maxDuration`（当前 30s）。
 */
export const maxDuration = 30;

/** Bundled for Vercel `api/[[...path]].js` — avoids Vercel typechecking all of `server/` with nodenext. */
export default handle(app);
