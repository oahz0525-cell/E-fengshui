import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { CITIES, CITY_COMPAT, DISTANCE_BUCKETS } from '@/data/elements';
import { haversine } from '@/utils/geo';
import { trpc } from '@/providers/trpc';
import type { DestinyMode } from '@/types';

type DestinyLog = {
  mode: DestinyMode;
  name: string;
  poem: string;
  at: string;
};

export function CityDiagnosis({
  el,
  onOpenDestiny,
  destinyLog,
  destinyExhausted,
  destinyReady,
}: {
  el: string;
  onOpenDestiny: () => void;
  /** 今日已落签 */
  destinyLog: DestinyLog[];
  /** 满三签后不可再开寻地 */
  destinyExhausted: boolean;
  /** 设备 ID 已就绪（本地存储可读） */
  destinyReady: boolean;
}) {
  const { location, setWikiLang } = useAppStore();
  const [cityName, setCityName] = useState('');
  const [cityEl, setCityEl] = useState('');
  const [compat, setCompat] = useState(60);
  const [desc, setDesc] = useState('');

  const presetCity = useMemo(() => {
    if (!location) return null;
    let best: (typeof CITIES)[0] | null = null;
    let bestDist = Infinity;
    for (const c of CITIES) {
      const d = haversine(location.lat, location.lng, c.lat, c.lng);
      if (d < bestDist && d < c.radius) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  }, [location]);

  const remoteQuery = trpc.geo.cityInfo.useQuery(
    { lat: location?.lat ?? 0, lng: location?.lng ?? 0 },
    { enabled: !!location && presetCity === null },
  );

  useEffect(() => {
    if (!location) return;

    if (presetCity) {
      setCityName(presetCity.name);
      setCityEl(presetCity.el);
      setCompat((CITY_COMPAT as Record<string, Record<string, number>>)[el]?.[presetCity.el] ?? 60);
      setDesc(presetCity.desc);
      // 预设库里境外城市用英文维基，其余（北京、上海等）用中文维基，寻地 fallback 才有足够 POI
      setWikiLang(presetCity.name === '纽约' || presetCity.name === '洛杉矶' ? 'US' : 'CN');
      return;
    }

    if (remoteQuery.data) {
      setCityName(remoteQuery.data.name);
      setCityEl('土');
      setCompat(55);
      setDesc(remoteQuery.data.display + '。此地天地人交汇之所。');
      setWikiLang(remoteQuery.data.countryCode);
      return;
    }

    if (remoteQuery.isFetched && !remoteQuery.isFetching && !remoteQuery.data) {
      setCityName('');
      setCityEl('');
      setDesc('此处暂无城脉信息。天地之气无处不在，下方的开运指南依然有效。');
    }
  }, [
    el,
    location,
    presetCity,
    remoteQuery.data,
    remoteQuery.isFetched,
    remoteQuery.isFetching,
    setWikiLang,
  ]);

  const barColor = compat >= 80 ? '#6b8f4a' : compat >= 60 ? '#d4a574' : '#b0bec5';

  return (
    <div className="mb-6">
      <div className="p-6 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/30 mb-3">城脉诊断</p>
        {cityName && (
          <div className="text-[clamp(18px,5vw,24px)] font-light tracking-[0.06em] mb-1">{cityName}</div>
        )}
        {cityEl && <p className="text-[13px] text-[#e8e4dc]/30 mb-2">城脉五行 · {cityEl}</p>}
        <div className="flex items-center gap-2.5 my-2.5">
          <span className="text-[11px] text-[#e8e4dc]/30 shrink-0">八字契合</span>
          <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1.5s]"
              style={{ width: `${compat}%`, background: barColor }}
            />
          </div>
          <span className="text-[13px]" style={{ color: barColor }}>
            {compat}%
          </span>
        </div>
        <p className="text-[13px] text-[#e8e4dc]/50 leading-relaxed mt-2.5">{desc}</p>
        <button
          type="button"
          onClick={onOpenDestiny}
          disabled={destinyExhausted || !destinyReady}
          className={`w-full mt-4 py-3.5 rounded-[14px] text-sm flex items-center justify-center gap-2 border transition-all ${
            destinyExhausted || !destinyReady
              ? 'bg-white/[0.02] border-white/[0.06] text-[#e8e4dc]/30 cursor-not-allowed'
              : 'bg-white/[0.03] border-white/[0.08] text-[#e8e4dc]/75 hover:bg-white/[0.08] cursor-pointer'
          }`}
        >
          <span className="text-base">🗝️</span>
          {!destinyReady ? '准备中…' : destinyExhausted ? '今日寻地签已用尽' : '寻地密语'}
        </button>

        {destinyLog.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <p className="text-[11px] tracking-[0.18em] text-[#6b8f4a]/50 mb-3">今日寻地签（每天 3 签）</p>
            <ul className="space-y-3">
              {destinyLog.map((d, i) => (
                <li
                  key={`${d.at}-${i}`}
                  className="text-sm text-[#e8e4dc]/65 leading-relaxed border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-[#b4a064]/60 text-xs mr-2">
                    {DISTANCE_BUCKETS[d.mode]?.label ?? d.mode}
                  </span>
                  <span className="text-[#e8e4dc]/90">{d.name}</span>
                  <p className="text-xs text-[#e8e4dc]/40 mt-1 line-clamp-2">{d.poem}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
