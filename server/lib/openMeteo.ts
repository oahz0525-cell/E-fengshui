/** 免费开放数据：Open-Meteo，无需 API Key（路线 A） */

function wmoCodeToZh(code: number): string {
  if (code === 0) return "晴";
  if (code <= 3) return "多云";
  if (code <= 48) return "有雾或霾";
  if (code <= 67) return "有雨";
  if (code <= 77) return "有雪或冰雹";
  if (code <= 82) return "阵雨";
  if (code <= 86) return "降雪";
  if (code <= 99) return "雷暴";
  return "天气变化";
}

/** 一段可读的中文实况 + 简明日预报，供 LLM 个性化引用 */
export async function fetchOpenMeteoSummary(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m",
    );
    url.searchParams.set("daily", "weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min");
    url.searchParams.set("forecast_days", "2");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        rain?: number;
        weather_code?: number;
        wind_speed_10m?: number;
        wind_direction_10m?: number;
      };
      daily?: {
        weather_code?: number[];
        precipitation_probability_max?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
      };
    };

    const cur = data.current;
    const daily = data.daily;
    if (!cur) return null;

    const nowWx = wmoCodeToZh(cur.weather_code ?? 0);
    const parts: string[] = [];
    parts.push(
      `当前约${cur.temperature_2m != null ? Math.round(cur.temperature_2m) : "?"}°C，体感${
        cur.apparent_temperature != null ? Math.round(cur.apparent_temperature) : "?"
      }°C，${nowWx}`,
    );
    if (cur.relative_humidity_2m != null) parts.push(`湿度约${Math.round(cur.relative_humidity_2m)}%`);
    if (cur.wind_speed_10m != null) {
      parts.push(`近地面风速约${cur.wind_speed_10m.toFixed(1)}m/s`);
    }
    if (cur.precipitation != null && cur.precipitation > 0) parts.push(`当前降水量${cur.precipitation.toFixed(1)}mm`);

    if (daily?.weather_code?.[1] != null) {
      const tmax = daily.temperature_2m_max?.[1];
      const tmin = daily.temperature_2m_min?.[1];
      const rainP = daily.precipitation_probability_max?.[1];
      const t = tmax != null && tmin != null ? `明日气温约${Math.round(tmin)}–${Math.round(tmax)}°C` : "";
      const w = wmoCodeToZh(daily.weather_code[1]);
      const p = rainP != null ? `、降水概率约${Math.round(rainP)}%` : "";
      parts.push([`明日趋势：${w}`, t, p].filter(Boolean).join(""));
    }

    return parts.join("；");
  } catch {
    return null;
  }
}
