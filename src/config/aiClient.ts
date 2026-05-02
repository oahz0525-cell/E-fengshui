/**
 * How long the browser waits for one tRPC AI round-trip.
 * Keep below `vercel.json` → `functions["api/trpc/[...path].js"].maxDuration` (seconds),
 * minus a few seconds for overhead.
 */
const DEFAULT_MS = 52_000;

function readTimeoutMs(): number {
  const raw = import.meta.env.VITE_AI_CLIENT_TIMEOUT_MS;
  if (raw === undefined || raw === "") return DEFAULT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 5_000 && n <= 120_000 ? Math.floor(n) : DEFAULT_MS;
}

export const AI_CLIENT_TIMEOUT_MS = readTimeoutMs();

/** Retries only when the request hits `withTimeout` (hung/slow edge), not on 4xx/5xx. */
export const AI_RETRY_ON_TIMEOUT = 1;

export const AI_RETRY_DELAY_MS = 700;
