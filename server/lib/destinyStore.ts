import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { env } from "./env";

const MAX_PER_DAY = 3;
const STORE_VERSION = 1;

export type DestinyDrawRecord = {
  mode: "near" | "mid" | "far";
  name: string;
  poem: string;
  dist: number;
  at: string;
};

type DayBucket = { date: string; draws: DestinyDrawRecord[] };

type Persisted = {
  version: number;
  /** sha256 切片键 → 当日记录 */
  buckets: Record<string, DayBucket>;
};

function storePath(): string {
  return path.join(process.cwd(), "data", "destiny-quota.json");
}

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 设备 ID（前端 localStorage UUID）+ 盐 → 存储桶键，不按公网 IP（避免同一 WiFi 共用额度） */
export function deviceStorageKey(deviceId: string): string {
  const salt = env.appSecret || "efengshui-local";
  return createHash("sha256")
    .update(`${deviceId}|destiny|${salt}`)
    .digest("hex")
    .slice(0, 32);
}

function load(): Persisted {
  const p = storePath();
  try {
    if (!existsSync(p)) {
      return { version: STORE_VERSION, buckets: {} };
    }
    const raw = readFileSync(p, "utf-8");
    const data = JSON.parse(raw) as Persisted;
    if (!data.buckets || typeof data.buckets !== "object") {
      return { version: STORE_VERSION, buckets: {} };
    }
    return data;
  } catch {
    return { version: STORE_VERSION, buckets: {} };
  }
}

function save(data: Persisted): void {
  const p = storePath();
  const dir = path.dirname(p);
  mkdirSync(dir, { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 0), "utf-8");
  renameSync(tmp, p);
}

export function getDestinyDayState(deviceId: string): {
  draws: DestinyDrawRecord[];
  remaining: number;
  exhausted: boolean;
} {
  const key = deviceStorageKey(deviceId);
  const today = todayKey();
  const data = load();
  const bucket = data.buckets[key];
  if (!bucket || bucket.date !== today) {
    return { draws: [], remaining: MAX_PER_DAY, exhausted: false };
  }
  const draws = bucket.draws;
  const remaining = Math.max(0, MAX_PER_DAY - draws.length);
  return { draws, remaining, exhausted: remaining <= 0 };
}

export function commitDestinyDraw(
  deviceId: string,
  draw: Omit<DestinyDrawRecord, "at">,
): { ok: boolean; remaining: number; draws: DestinyDrawRecord[]; message?: string } {
  const key = deviceStorageKey(deviceId);
  const today = todayKey();
  const data = load();
  let bucket = data.buckets[key];
  if (!bucket || bucket.date !== today) {
    bucket = { date: today, draws: [] };
    data.buckets[key] = bucket;
  }
  if (bucket.draws.length >= MAX_PER_DAY) {
    return { ok: false, remaining: 0, draws: bucket.draws, message: "今日三签已用尽" };
  }
  const rec: DestinyDrawRecord = {
    ...draw,
    at: new Date().toISOString(),
  };
  bucket.draws.push(rec);
  save(data);
  const remaining = Math.max(0, MAX_PER_DAY - bucket.draws.length);
  return { ok: true, remaining, draws: bucket.draws };
}
