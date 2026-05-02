/**
 * Default wait for one tRPC AI round-trip.
 * When keys/API 不可用，最终会回落本地锦囊——过长等待只会消耗耐心。
 * 需要「多为 AI」时在部署环境设置 `VITE_AI_CLIENT_TIMEOUT_MS`（如 52000）。
 * Must stay below `vercel.json` → `api/trpc` maxDuration.
 */
const DEFAULT_MS = 18_000;

function readTimeoutMs(): number {
  const raw = import.meta.env.VITE_AI_CLIENT_TIMEOUT_MS;
  if (raw === undefined || raw === "") return DEFAULT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 5_000 && n <= 120_000 ? Math.floor(n) : DEFAULT_MS;
}

export const AI_CLIENT_TIMEOUT_MS = readTimeoutMs();

/** 超时重试：默认关闭以免在无 Key 或网络差时加倍等待；可用 env 覆盖（见下方导出若需要后续再加） */
export const AI_RETRY_ON_TIMEOUT = 0;

export const AI_RETRY_DELAY_MS = 600;
