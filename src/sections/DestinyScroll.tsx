import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { trpc } from '@/providers/trpc';
import { DISTANCE_BUCKETS } from '@/data/elements';
import { POEM_TEMPLATES } from '@/data/poems';
import { haversine } from '@/utils/geo';
import { hash } from '@/utils/hash';
import { withTimeout } from '@/utils/withTimeout';
import { DESTINY_DRAW_TOTAL_MS, NEARBY_SPOT_API_CONNECT_MS } from '@/config/clientTiming';
import type { DestinyMode, Element } from '@/types';
import type { DestinyLogItem } from '@/hooks/useDestinyQuota';
import { PRESET_CITIES } from '@contracts/presetCities';
import { pickPresetCitySpotCore } from '@contracts/pickPresetSpotCore';

type PendingDraw = {
  mode: DestinyMode;
  name: string;
  poem: string;
  dist: number;
  fallback?: boolean;
};

export function DestinyScroll({
  onClose,
  remainingSlots,
  onCommitDraw,
  excludeNames,
}: {
  onClose: () => void;
  remainingSlots: number;
  onCommitDraw: (
    draw: Omit<DestinyLogItem, 'at'>,
  ) => { ok: boolean; remaining: number; draws: DestinyLogItem[]; message?: string };
  excludeNames: string[];
}) {
  const { location, element, xiShen, wikiLang } = useAppStore();
  const aiPoem = useSettingsStore((s) => s.aiPoem);
  const nearbyMut = trpc.geo.nearbySpot.useMutation();
  const poemMut = trpc.ai.spotPoem.useMutation();

  const [loading, setLoading] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [mode, setMode] = useState<DestinyMode | null>(null);
  const [pendingDraw, setPendingDraw] = useState<PendingDraw | null>(null);

  /** iOS / iPadOS 全系浏览器均为 WebKit，半透明叠层易与页面糊在一起 */
  const isIOSLike =
    typeof navigator !== 'undefined' &&
    (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const rollRef = useRef(0);
  const [slotsLeft, setSlotsLeft] = useState(remainingSlots);
  useEffect(() => {
    setSlotsLeft(remainingSlots);
  }, [remainingSlots]);

  const selectMode = (m: DestinyMode) => {
    setMode(m);
    setDrawError(null);
  };

  const distStr = (distM: number) => {
    if (!location) return '';
    const d = distM / 1000;
    return d < 1 ? `${distM}m` : `${d.toFixed(1)}km`;
  };

  const finishAndClose = () => {
    if (!pendingDraw) return;
    const cr = onCommitDraw({
      mode: pendingDraw.mode,
      name: pendingDraw.name,
      poem: pendingDraw.poem,
      dist: pendingDraw.dist,
    });
    if (!cr.ok) {
      setDrawError(cr.message || '今日签数已满');
      return;
    }
    setSlotsLeft(cr.remaining);
    setPendingDraw(null);
    onClose();
  };

  const dismissOverlay = () => {
    if (pendingDraw) {
      finishAndClose();
      return;
    }
    onClose();
  };

  const doDraw = async () => {
    if (!mode) return;
    if (!location) {
      setDrawError('未获取到定位坐标。请在上一页开启定位或手动填写经纬度后再试。');
      return;
    }
    if (slotsLeft <= 0) {
      setDrawError('今日三签已用尽，请明天再来。');
      return;
    }
    setLoading(true);
    setDrawError(null);
    rollRef.current += 1;
    const rollId = rollRef.current;
    const seed = (Math.floor(Date.now() % 2_000_000_000) + rollId * 97) >>> 0;
    const xiAllowed = new Set<Element>(['木', '火', '土', '金', '水']);
    const xiPayload = (xiShen.xi ?? []).filter((x): x is Element => xiAllowed.has(x as Element));

    const started = Date.now();

    type SpotShape = {
      name: string;
      lat: number;
      lng: number;
      dist?: number;
      type?: string;
      fallback?: boolean;
    };

    const templatePoemFor = (sv: SpotShape): string => {
      const t = (sv.type || 'default') as keyof typeof POEM_TEMPLATES;
      const xiEl = (xiShen.xi[0] || '木') as keyof (typeof POEM_TEMPLATES)['default'];
      const pool =
        POEM_TEMPLATES[t]?.[xiEl] || POEM_TEMPLATES['default'][xiEl] || POEM_TEMPLATES['default']['木'];
      const idx = hash(`${sv.name}|${xiEl}|${rollId}|${seed}`) % pool.length;
      return pool[idx];
    };

    try {
      let spot: SpotShape | null = null;

      try {
        const res = await withTimeout(
          nearbyMut.mutateAsync({
            lat: location.lat,
            lng: location.lng,
            element: element as Element,
            wikiLang: wikiLang?.trim() || 'US',
            mode,
            seed,
            rollId,
            excludeNames,
            xi: xiPayload,
          }),
          NEARBY_SPOT_API_CONNECT_MS,
        );
        if (res.spot) spot = res.spot;
      } catch {
        /* 逾时或网络/HTML 解析失败 */
      }

      if (!spot) {
        const local = pickPresetCitySpotCore(
          location.lat,
          location.lng,
          element as Element,
          xiPayload.length ? xiPayload : null,
          mode,
          seed,
          rollId,
          excludeNames,
          PRESET_CITIES,
          undefined,
        );
        if (local) spot = local;
      }

      if (!spot) {
        setDrawError('此方灵机暂未接应，可换一个「寻地之距」或稍后再摇。');
        return;
      }

      const dist =
        spot.dist ?? Math.round(haversine(location.lat, location.lng, spot.lat, spot.lng) * 1000);
      const elapsed = Date.now() - started;
      const budgetLeft = DESTINY_DRAW_TOTAL_MS - elapsed;

      let poemOut: string;
      if (budgetLeft <= 0) {
        poemOut = templatePoemFor(spot);
      } else if (aiPoem && budgetLeft > 400) {
        const aiMs = Math.min(budgetLeft - 80, 2000);
        try {
          const pr = await withTimeout(
            poemMut.mutateAsync({
              spotName: spot.name,
              dist: spot.dist ?? dist,
              xi: xiShen.xi.map(String),
            }),
            Math.max(250, aiMs),
          );
          poemOut = (pr.poem && String(pr.poem).trim()) || '';
        } catch {
          poemOut = '';
        }
        if (!poemOut) poemOut = templatePoemFor(spot);
      } else {
        poemOut = templatePoemFor(spot);
      }

      setPendingDraw({
        mode,
        name: spot.name,
        poem: poemOut,
        dist,
        fallback: spot.fallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const showPicker = !loading && !pendingDraw;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
        isIOSLike
          ? 'bg-[#070605]'
          : 'bg-[#09090b]/96 backdrop-blur-xl'
      }`}
      onClick={(e) => e.target === e.currentTarget && dismissOverlay()}
    >
      <div
        className="w-full max-w-[420px] relative isolate [transform:translateZ(0)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 rounded-[20px] bg-gradient-to-b from-[#2a261f] to-[#141210] border border-[#b4a064]/35 shadow-[0_24px_64px_rgba(0,0,0,0.75)] ring-1 ring-black/50">
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#b4a064]/45 to-transparent" />

          {showPicker && (
            <div>
              <div className="text-center text-sm tracking-[0.25em] text-[#b4a064]/50 mb-5">寻 地 密 语</div>
              <div className="text-center text-sm text-[#e8e4dc]/40 mb-5">选择寻地之距</div>
              <div className="flex flex-col gap-3 mb-4">
                {(Object.entries(DISTANCE_BUCKETS) as [DestinyMode, (typeof DISTANCE_BUCKETS)['near']][]).map(
                  ([key, b]) => (
                    <div
                      key={key}
                      onClick={() => selectMode(key)}
                      className={`p-5 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border ${
                        mode === key
                          ? 'bg-[#1e2a18] border-[#6b8f4a]/45'
                          : 'bg-[#1f1c17] border-[#4a4338]/80 hover:bg-[#252018] hover:-translate-y-0.5'
                      }`}
                    >
                      <span className="text-[28px] shrink-0 opacity-70">{b.icon}</span>
                      <div>
                        <div className="text-base tracking-[0.06em] text-[#e8e4dc] mb-1">{b.label}</div>
                        <div className="text-xs text-[#e8e4dc]/35">{b.sub}</div>
                      </div>
                    </div>
                  ),
                )}
              </div>
              {drawError && (
                <p className="text-center text-xs text-amber-200/70 leading-relaxed mb-4 px-1">{drawError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={doDraw}
                  disabled={!mode || slotsLeft <= 0}
                  className={`flex-1 py-3.5 rounded-[14px] text-sm border transition-all cursor-pointer ${
                    mode && slotsLeft > 0
                      ? 'bg-[#243520] border-[#6b8f4a]/40 text-[#a8c896] hover:bg-[#2a4028]'
                      : 'bg-[#1a1816] border-[#3a3632] text-[#e8e4dc]/30 opacity-40 pointer-events-none'
                  }`}
                >
                  🎋 抽签
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-[14px] text-sm bg-[#1f1c18] border border-[#4a4338]/90 text-[#e8e4dc]/75 hover:bg-[#28241e] cursor-pointer transition-all"
                >
                  返回
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center py-12 px-4">
              <div className="destiny-shake text-[68px] leading-none mb-5 select-none [will-change:transform]" aria-hidden>
                🎋
              </div>
              <p className="text-sm text-[#e8e4dc]/50 tracking-[0.2em]">灵签摇响中…</p>
              <p className="text-xs text-[#e8e4dc]/30 mt-2">正在为你寻一方天地</p>
            </div>
          )}

          {pendingDraw && !loading && (
            <div className="animate-[sealedReveal_0.6s_ease-out_forwards]">
              <div className="text-center text-sm tracking-[0.25em] text-[#b4a064]/50 mb-5">寻 地 密 语</div>
              <div className="text-center text-[22px] font-light tracking-[0.08em] text-[#e8e4dc] mb-1.5">{pendingDraw.name}</div>
              <div className="text-center text-xs text-[#e8e4dc]/35 mb-4">
                {distStr(pendingDraw.dist)} · {xiShen.xi[0]}行之地
              </div>
              <div className="text-sm leading-[2] text-[#e8e4dc]/60 text-center italic">{pendingDraw.poem}</div>
              {pendingDraw.fallback && (
                <div className="text-center text-[11px] text-[#6b8f4a]/40 mt-1.5">
                  {DISTANCE_BUCKETS[pendingDraw.mode].label}范围内可调地点较少，已为你放宽匹配
                </div>
              )}
              {drawError && (
                <p className="text-center text-xs text-amber-200/70 mt-3 px-1">{drawError}</p>
              )}
              <button
                type="button"
                onClick={finishAndClose}
                className="w-full mt-6 py-3.5 rounded-[14px] text-sm bg-[#243520] border border-[#6b8f4a]/40 text-[#a8c896] hover:bg-[#2a4028] cursor-pointer transition-all"
              >
                关闭 · 记入今日寻地签
              </button>
              <p className="text-center text-[10px] text-[#e8e4dc]/25 mt-2">关闭后本条会出现在下方「今日寻地签」列表</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
