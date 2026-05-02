import { handle } from "hono/vercel";
import app from "./boot";

/** Bundled for Vercel `api/[[...path]].js` — avoids Vercel typechecking all of `server/` with nodenext. */
export default handle(app);
