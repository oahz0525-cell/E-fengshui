import { useCallback, useEffect, useState } from 'react';
import type { DestinyMode } from '@/types';

const STORAGE_KEY = 'efengshui_destiny_quota_v1';
const MAX_PER_DAY = 3;

export type DestinyLogItem = {
  mode: DestinyMode;
  name: string;
  poem: string;
  dist: number;
  at: string;
};

type Stored = {
  date: string;
  draws: DestinyLogItem[];
};

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readStorage(): Stored {
  const empty: Stored = { date: todayKey(), draws: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Stored;
    if (!Array.isArray(data.draws) || !data.date) return empty;
    if (data.date !== todayKey()) return empty;
    return data;
  } catch {
    return empty;
  }
}

function writeStorage(data: Stored): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Safari private mode / storage quota: fail silently
  }
}

export function useDestinyQuota() {
  const [ready, setReady] = useState(false);
  const [draws, setDraws] = useState<DestinyLogItem[]>([]);

  useEffect(() => {
    const data = readStorage();
    writeStorage(data);
    setDraws(data.draws);
    setReady(true);
  }, []);

  const remaining = Math.max(0, MAX_PER_DAY - draws.length);
  const exhausted = remaining <= 0;

  const commitDraw = useCallback((item: Omit<DestinyLogItem, 'at'>) => {
    const data = readStorage();
    if (data.draws.length >= MAX_PER_DAY) {
      return { ok: false as const, remaining: 0, draws: data.draws, message: '今日三签已用尽' };
    }
    const rec: DestinyLogItem = { ...item, at: new Date().toISOString() };
    const next = { date: todayKey(), draws: [...data.draws, rec] };
    writeStorage(next);
    setDraws(next.draws);
    return {
      ok: true as const,
      remaining: Math.max(0, MAX_PER_DAY - next.draws.length),
      draws: next.draws,
    };
  }, []);

  return { ready, draws, remaining, exhausted, commitDraw };
}
