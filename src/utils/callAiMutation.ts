import { withTimeout } from "./withTimeout";

function isTimeoutError(e: unknown): boolean {
  return e instanceof Error && e.message === "timeout";
}

/**
 * Runs an AI tRPC mutation with a generous timeout and optional retry **only** after a
 * client-side timeout (slow cold start / stalled connection). Errors from the server
 * are not retried.
 */
export async function callAiMutation<T>(
  run: () => Promise<T>,
  options?: {
    timeoutMs?: number;
    retriesOnTimeout?: number;
    retryDelayMs?: number;
  },
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 52_000;
  const retriesOnTimeout = options?.retriesOnTimeout ?? 0;
  const retryDelayMs = options?.retryDelayMs ?? 700;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retriesOnTimeout; attempt++) {
    try {
      return await withTimeout(run(), timeoutMs);
    } catch (e) {
      lastErr = e;
      if (!isTimeoutError(e) || attempt >= retriesOnTimeout) throw e;
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
  throw lastErr;
}
