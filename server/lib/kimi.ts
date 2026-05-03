import { env } from "./env";

const KIMI_URL = "https://api.moonshot.cn/v1/chat/completions";
const OPENAI_URL = `${env.openaiBaseUrl.replace(/\/$/, "")}/chat/completions`;

/** Upper bound on completion length per task — smaller = faster generation & lower latency. */
const MAX_OUT_FUN_ADVICE = 420;
const MAX_OUT_PROPHECY = 400;
const MAX_OUT_SPOT_POEM = 220;
const MAX_OUT_DEFAULT = 520;

async function chatOnce(
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const key = env.kimiApiKey;
  if (!key) return null;
  const res = await fetch(KIMI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function chatGeminiOnce(prompt: string, maxTokens: number): Promise<string | null> {
  const key = env.geminiApiKey;
  if (!key) return null;
  const model = env.geminiModel.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: maxTokens,
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function chatOpenAIOnce(
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const key = env.openaiApiKey;
  if (!key) return null;
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function callLlm(prompt: string): Promise<string | null> {
  const r = await callLlmWithProvider(prompt, { maxOutputTokens: MAX_OUT_DEFAULT });
  return r.text;
}

export type LlmProvider = "kimi" | "gemini" | "openai" | "none";

export async function callLlmWithProvider(
  prompt: string,
  options?: { maxOutputTokens?: number },
): Promise<{ text: string | null; provider: LlmProvider }> {
  const maxTokens = Math.min(
    8192,
    Math.max(64, options?.maxOutputTokens ?? MAX_OUT_DEFAULT),
  );
  const primary = env.kimiModel.trim() || "kimi-k2-turbo-preview";
  const fallbacks = ["kimi-k2-turbo-preview", "moonshot-v1-32k", "moonshot-v1-128k"];
  const models = [primary, ...fallbacks.filter((m) => m !== primary)];
  try {
    if (env.kimiApiKey) {
      for (const model of models) {
        const text = await chatOnce(model, prompt, maxTokens);
        if (text) return { text, provider: "kimi" };
      }
    }
    if (env.geminiApiKey) {
      const text = await chatGeminiOnce(prompt, maxTokens);
      if (text) return { text, provider: "gemini" };
    }
    if (env.openaiApiKey) {
      const text = await chatOpenAIOnce(
        env.openaiModel.trim() || "gpt-4o-mini",
        prompt,
        maxTokens,
      );
      if (text) return { text, provider: "openai" };
    }
    return { text: null, provider: "none" };
  } catch {
    return { text: null, provider: "none" };
  }
}

export type UserContextExtra = {
  stem?: string;
  floor?: number;
  goalKey?: string;
  cityHint?: string;
  /** Open-Meteo 等真实预报摘要 */
  forecastDetail?: string;
};

export async function generateFunAdviceLines(
  el: string,
  xi: string[],
  goal: string,
  weather: string,
  loc: string,
  extra?: UserContextExtra,
): Promise<{ lines: string[] | null; provider: LlmProvider }> {
  const ctx =
    extra &&
    (extra.stem ||
      extra.floor != null ||
      extra.goalKey ||
      extra.cityHint ||
      extra.forecastDetail)
      ? `\n补充背景（仅供你内化意象，禁止照抄到正文里）：日主天干 ${extra.stem || "未知"}；楼层 ${extra.floor ?? "未知"}；意图 ${extra.goalKey || "未知"}；地域 ${extra.cityHint || "未知"}；近日天象参考 ${extra.forecastDetail || "（无）"}`
      : "";
  const prompt = `你是一位松弛感风水顾问。用户八字日主五行${el}，喜用神${xi.join(
    "、",
  )}，今日想提升「${goal}」，坐标${loc}。页面天气标签（写意即可）：${weather}。${ctx}

写作要求（必须遵守）：
1. 输出3条「开运指南」，风格贴近生活化短句：诗意、有趣、通俗易懂，像朋友说悄悄话；可参考内置锦囊那种「小动作 + 小画面」，但不要抄袭原句。
2. **禁止**在正文里写出任何气象数值或单位：不要出现摄氏度、℃、mm、m/s、湿度%、降水概率%、具体数字时段等；可把晴雨冷暖转化为意象（例如「风贴在脸上」「雨声贴窗」「阳光薄得像纸」）。
3. 不要直白堆砌五行术语；结合心理学与易经意象即可。
4. 每条前面加一个 emoji，控制在40字以内。
直接输出3条，每条一行，格式：emoji 建议内容`;
  const { text, provider } = await callLlmWithProvider(prompt, {
    maxOutputTokens: MAX_OUT_FUN_ADVICE,
  });
  if (!text) return { lines: null, provider };
  return { lines: text.split("\n").filter((l) => l.trim().length > 5).slice(0, 3), provider };
}

export async function generateSpotPoemText(
  spotName: string,
  dist: number,
  xi: string[],
): Promise<{ poem: string | null; provider: LlmProvider }> {
  const prompt = `你是一位松弛感风水顾问。用户今日来到"${spotName}"，距离约${Math.round(dist)}米。用户八字喜${xi.join("、")}。请生成一段40字以内的诗意场景描述，不要直白解释五行，用画面感和动作感，语气松弛自然像朋友聊天。`;
  const { text, provider } = await callLlmWithProvider(prompt, {
    maxOutputTokens: MAX_OUT_SPOT_POEM,
  });
  const poem = text ? text.replace(/^["'`]+|["'`]+$/g, "").trim() : null;
  return { poem, provider };
}

export type ProphecyAIResult = {
  advice: string;
  dir: string;
  time: string;
  itemName: string;
  itemDesc: string;
  itemEmoji: string;
};

export async function generateProphecyBlock(
  xi: string[],
  lat: number,
  lng: number,
  extra?: UserContextExtra,
): Promise<{ block: ProphecyAIResult | null; provider: LlmProvider }> {
  const ctx =
    extra &&
    (extra.stem ||
      extra.floor != null ||
      extra.goalKey ||
      extra.cityHint ||
      extra.forecastDetail)
      ? ` 用户日主天干 ${extra.stem || "未知"}；楼层 ${extra.floor ?? "未知"}；意图 ${extra.goalKey || "未知"}；地域 ${extra.cityHint || "未知"}；明日相关气象参考 ${extra.forecastDetail || "（无）"}`
      : "";
  const prompt = `你是松弛感命理文案。用户八字喜用神：${xi.join("、")}。坐标约 ${lat.toFixed(2)},${lng.toFixed(2)}。${ctx}

写作要求：advice 字段要有诗意与画面感，有趣易懂；**禁止**写入气象数值、湿度百分比、风速 m/s、降水概率等技术指标；可把天气趋势写成隐喻（阴晴雨雪风），不要写成天气预报。
请只输出一段合法 JSON（不要 markdown），格式：
{"advice":"明日运势语气松弛的一段中文60字内","dir":"东或南或西或北或东南或东北或西南或西北之一","time":"像07:00-09:00这样的时段","itemName":"随身小物名称四字内","itemDesc":"描述25字内","itemEmoji":"单个emoji"}
`;
  const { text: raw, provider } = await callLlmWithProvider(prompt, {
    maxOutputTokens: MAX_OUT_PROPHECY,
  });
  if (!raw) return { block: null, provider };
  const slice = raw.match(/\{[\s\S]*\}/);
  if (!slice) return { block: null, provider };
  try {
    const o = JSON.parse(slice[0]) as Record<string, string>;
    const dir = String(o.dir || "").trim();
    const okDir = ["东", "南", "西", "北", "东南", "东北", "西南", "西北"].includes(dir);
    return { block: {
      advice: String(o.advice || "").trim(),
      dir: okDir ? dir : "东",
      time: String(o.time || "").trim() || "09:00-11:00",
      itemName: String(o.itemName || "").trim() || "小物",
      itemDesc: String(o.itemDesc || "").trim(),
      itemEmoji: String(o.itemEmoji || "✨").trim(),
    }, provider };
  } catch {
    return { block: null, provider };
  }
}
