/**
 * 单次请求上限：逾时则走本地锦囊/预言。默认 3s，避免久等后仍是预制库。
 * 需要尽量等 AI 时在 Vercel 设 `VITE_AI_CLIENT_TIMEOUT_MS`（如 45000，须小于 maxDuration）。
 */
const DEFAULT_MS = 3_000;

function readTimeoutMs(): number {
  const raw = import.meta.env.VITE_AI_CLIENT_TIMEOUT_MS;
  if (raw === undefined || raw === "") return DEFAULT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 5_000 && n <= 120_000 ? Math.floor(n) : DEFAULT_MS;
}

export const AI_CLIENT_TIMEOUT_MS = readTimeoutMs();

/** 寻地密语在 geo 之后；原先下限 12s 体感过长，改为约 5s 内无响应即回落内置诗句 */
const SPOT_POEM_MIN_MS = 5_000;
const SPOT_POEM_MAX_MS = 45_000;
export const AI_SPOT_POEM_CLIENT_MS = Math.min(
  SPOT_POEM_MAX_MS,
  Math.max(AI_CLIENT_TIMEOUT_MS, SPOT_POEM_MIN_MS),
);

/** 超时重试：默认关闭以免在无 Key 或网络差时加倍等待；可用 env 覆盖（见下方导出若需要后续再加） */
export const AI_RETRY_ON_TIMEOUT = 0;

export const AI_RETRY_DELAY_MS = 600;

/** 用户展开锦囊/预言后，若此时仍未拿到接口结果，最多再等这么久（毫秒）即显示预制库 */
export const AI_EXPAND_FALLBACK_MS = 3_000;
