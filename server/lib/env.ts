import "dotenv/config";

/**
 * 仅当「无 DB 仅跑 AI + tRPC」的轻量部署时，APP_ID / DATABASE_URL 等可留空；
 * 需要 MySQL 或正式鉴权时在环境变量中补齐，并在 `getDb()` 等处再校验。
 */
function optional(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export const env = {
  appId: optional("APP_ID"),
  appSecret: optional("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: optional("DATABASE_URL"),
  /** Moonshot / Kimi — set on the server only; never exposed to the browser */
  kimiApiKey: optional("KIMI_API_KEY"),
  /** e.g. kimi-k2-turbo-preview — moonshot-v1-8k 已逐步停用 */
  kimiModel: optional("KIMI_MODEL") || "kimi-k2-turbo-preview",
  /** Amap — optional; Wikipedia fallback when empty */
  gaodeKey: optional("GAODE_KEY"),
  /** Google Places key for overseas fallback */
  googleMapsApiKey: optional("GOOGLE_MAPS_API_KEY"),
  /** Google Gemini — Kimi 失败时的备选（generativelanguage.googleapis.com） */
  geminiApiKey: optional("GEMINI_API_KEY"),
  /** 默认 gemini-2.0-flash；可通过 GEMINI_MODEL 覆盖 */
  geminiModel: optional("GEMINI_MODEL") || "gemini-2.0-flash",
  /** Optional generic LLM fallback when Kimi is unavailable */
  openaiApiKey: optional("OPENAI_API_KEY"),
  openaiModel: optional("OPENAI_MODEL") || "gpt-4o-mini",
  openaiBaseUrl: optional("OPENAI_BASE_URL") || "https://api.openai.com/v1",
};
