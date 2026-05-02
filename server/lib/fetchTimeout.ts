/** Vercel serverless 外挂请求默认上限，避免拖到函数 60s / 504 */
export const EXTERNAL_FETCH_MS = 10_000;

/**
 * `fetch` + 超时中止；超时时 `fetch` reject（常为 `AbortError`），由调用方捕获并降级。
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit | undefined,
  ms: number = EXTERNAL_FETCH_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
