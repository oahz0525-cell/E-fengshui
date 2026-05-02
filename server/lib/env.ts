import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  /** Moonshot / Kimi — set on the server only; never exposed to the browser */
  kimiApiKey: optional("KIMI_API_KEY"),
  /** e.g. kimi-k2-turbo-preview — moonshot-v1-8k 已逐步停用 */
  kimiModel: optional("KIMI_MODEL") || "kimi-k2-turbo-preview",
  /** Amap — optional; Wikipedia fallback when empty */
  gaodeKey: optional("GAODE_KEY"),
  /** Google Places key for overseas fallback */
  googleMapsApiKey: optional("GOOGLE_MAPS_API_KEY"),
  /** DeepSeek — OpenAI-compatible chat API（官网控制台申请，按量计费） */
  deepseekApiKey: optional("DEEPSEEK_API_KEY"),
  deepseekModel: optional("DEEPSEEK_MODEL") || "deepseek-chat",
  deepseekBaseUrl: optional("DEEPSEEK_BASE_URL") || "https://api.deepseek.com/v1",
  /** Optional generic LLM fallback when Kimi is unavailable */
  openaiApiKey: optional("OPENAI_API_KEY"),
  openaiModel: optional("OPENAI_MODEL") || "gpt-4o-mini",
  openaiBaseUrl: optional("OPENAI_BASE_URL") || "https://api.openai.com/v1",
};
