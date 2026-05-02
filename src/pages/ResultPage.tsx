import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { trpc } from '@/providers/trpc';
import { genEnv, divineWeather, calcResult } from '@/services/calcService';
import { XI_SHEN, WEATHER } from '@/data/elements';
import type { Goal, XiShen } from '@/types';
import { ScoreRing } from '@/sections/ScoreRing';
import { SubScores } from '@/sections/SubScores';
import { EnvAnalysis } from '@/sections/EnvAnalysis';
import { CityDiagnosis } from '@/sections/CityDiagnosis';
import { FunAdvice } from '@/sections/FunAdvice';
import { Prophecy } from '@/sections/Prophecy';
import { DestinyScroll } from '@/sections/DestinyScroll';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { DIRS, GOALS } from '@/data/elements';
import { useDestinyQuota } from '@/hooks/useDestinyQuota';

export function ResultPage() {
  const { location, element, stem, xiShen, goal, floor, setCalcResult, setWeather, setEnv } = useAppStore();
  const weatherLabel = useAppStore((s) => s.weather);
  const [showDestiny, setShowDestiny] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [minLoadDone, setMinLoadDone] = useState(false);
  /** API 长时间无响应（既无 data 也无 isError）时结束加载，避免线上永久卡在 LoadingOverlay */
  const [apiStallBypass, setApiStallBypass] = useState(false);

  const destinyQuota = useDestinyQuota();

  const calcQuery = trpc.fengshui.calculate.useQuery(
    {
      lat: location?.lat ?? 39.9042,
      lng: location?.lng ?? 116.4074,
      floor,
      stem: stem || '甲',
      goal: goal || 'creation',
    },
    { enabled: !!location && !!stem && !!goal },
  );
  const weatherQuery = trpc.fengshui.weather.useQuery(
    { lat: location?.lat ?? 39.9042, lng: location?.lng ?? 116.4074 },
    { enabled: !!location },
  );
  const forecastQuery = trpc.fengshui.forecast.useQuery(
    { lat: location?.lat ?? 0, lng: location?.lng ?? 0 },
    { enabled: !!location },
  );
  const cityQuery = trpc.geo.cityInfo.useQuery(
    { lat: location?.lat ?? 0, lng: location?.lng ?? 0 },
    { enabled: !!location },
  );

  useEffect(() => {
    if (calcQuery.data) {
      const d = calcQuery.data;
      setCalcResult({
        score: d.score,
        dir: d.bestDir,
        comment: d.scoreComment,
        subScores: d.subScores,
        env: d.env,
        xi: d.xiShen,
      });
      setEnv(d.env);
    }
  }, [calcQuery.data, setCalcResult, setEnv]);

  useEffect(() => {
    if (weatherQuery.data) {
      const w = weatherQuery.data;
      setWeather(`${w.icon} ${w.name} · ${w.desc}`);
    }
  }, [weatherQuery.data, setWeather]);

  // Offline / API failure: same algorithms as server (`api/engine`), computed locally
  useEffect(() => {
    if (!location || !stem || !goal) return;
    if (calcQuery.isLoading || calcQuery.isFetching) return;
    if (calcQuery.data) return;
    if (!calcQuery.isError) return;
    const environment = genEnv(location, floor);
    setEnv(environment);
    setCalcResult(calcResult(element, goal, environment, xiShen));
  }, [
    calcQuery.data,
    calcQuery.isError,
    calcQuery.isFetching,
    calcQuery.isLoading,
    element,
    floor,
    goal,
    location,
    setCalcResult,
    setEnv,
    stem,
    xiShen,
  ]);

  useEffect(() => {
    if (!location) return;
    if (weatherQuery.isLoading || weatherQuery.isFetching) return;
    if (weatherQuery.data) return;
    if (!weatherQuery.isError) return;
    const cond = divineWeather(location.lat, location.lng);
    const w = WEATHER[cond] ?? WEATHER.clear;
    setWeather(`${w.icon} ${w.name} · ${w.desc}`);
  }, [
    location,
    setWeather,
    weatherQuery.data,
    weatherQuery.isError,
    weatherQuery.isFetching,
    weatherQuery.isLoading,
  ]);

  useEffect(() => {
    const t = setTimeout(() => setMinLoadDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setApiStallBypass(true), 12_000);
    return () => clearTimeout(t);
  }, []);

  // API 挂起（既无结果也未标记 error）：超时后用与离线相同的本地推算填满 store
  useEffect(() => {
    if (!apiStallBypass || !location || !stem || !goal) return;
    if (calcQuery.data) return;
    const environment = genEnv(location, floor);
    setEnv(environment);
    setCalcResult(calcResult(element, goal, environment, xiShen));
  }, [
    apiStallBypass,
    calcQuery.data,
    element,
    floor,
    goal,
    location,
    setCalcResult,
    setEnv,
    stem,
    xiShen,
  ]);

  useEffect(() => {
    if (!apiStallBypass || !location) return;
    if (weatherQuery.data) return;
    const cond = divineWeather(location.lat, location.lng);
    const w = WEATHER[cond] ?? WEATHER.clear;
    setWeather(`${w.icon} ${w.name} · ${w.desc}`);
  }, [apiStallBypass, location, setWeather, weatherQuery.data]);

  const calcSettled =
    !location ||
    !stem ||
    !goal ||
    calcQuery.data != null ||
    calcQuery.isError ||
    apiStallBypass;
  const wxSettled =
    !location || weatherQuery.data != null || weatherQuery.isError || apiStallBypass;
  if (!calcSettled || !wxSettled || !minLoadDone) return <LoadingOverlay />;

  // Use store values (set by local frontend calculation)
  const { score, scoreComment, subScores, bestDir, env } = useAppStore.getState();
  const displayStem = stem || '甲';
  const displayElement = element || '木';
  const goalKey = (goal || 'creation') as Goal;
  const goalLabel = GOALS[goalKey] ?? GOALS.creation;
  const displayXiShen: XiShen = xiShen || XI_SHEN[displayElement as keyof typeof XI_SHEN] || XI_SHEN['木'];
  const forecastDetail = forecastQuery.data?.summary ?? '';
  const cityHint = cityQuery.data?.display || cityQuery.data?.name || '';

  return (
    <div className="page active">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <div className="md:w-[300px] md:border-r border-white/[0.05] p-6 flex flex-col items-center md:sticky md:top-0 md:h-screen border-b md:border-b-0">
          <p className="w-full max-w-[280px] text-[11px] text-[#e8e4dc]/42 leading-relaxed text-center md:text-left mb-5 px-1">
            <span className="text-[#e8e4dc]/58">{displayStem}（{displayElement}）</span>
            <span className="mx-1.5 text-[#e8e4dc]/20">·</span>
            <span>喜{displayXiShen.xi.join('、')} 忌{displayXiShen.ji.join('、')}</span>
            <span className="mx-1.5 text-[#e8e4dc]/20">·</span>
            <span className="text-[#6b8f4a]/95">{goalLabel}</span>
          </p>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/30 mb-5">今日最佳朝向</p>
          <Compass bestDir={bestDir} />
          <div className="text-center mt-5">
            <p className="text-[13px] text-[#e8e4dc]/30">最佳朝向</p>
            <p className="text-[20px] mt-1 text-[#6b8f4a]">{bestDir}</p>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <ScoreRing score={score} comment={scoreComment} />
          <SubScores subs={subScores} xi={displayXiShen} />
          {env && <EnvAnalysis env={env} xi={displayXiShen} dir={bestDir} />}
          <CityDiagnosis
            el={displayElement}
            destinyLog={destinyQuota.draws}
            destinyExhausted={destinyQuota.exhausted}
            destinyReady={destinyQuota.ready}
            onOpenDestiny={() => {
              if (!destinyQuota.ready || destinyQuota.exhausted) return;
              setShowDestiny(true);
            }}
          />
          {env && (
            <FunAdvice
              xi={displayXiShen}
              goalLabel={goalLabel}
              el={displayElement}
              lat={location?.lat || 0}
              lng={location?.lng || 0}
              weatherLabel={weatherLabel}
              forecastDetail={forecastDetail}
              cityHint={cityHint}
              stem={displayStem}
              floor={floor}
              goalKey={goalKey}
            />
          )}
          <Prophecy
            xi={displayXiShen}
            lat={location?.lat || 0}
            lng={location?.lng || 0}
            forecastDetail={forecastDetail}
            cityHint={cityHint}
            stem={displayStem}
            floor={floor}
            goalKey={goalKey}
          />
        </div>
      </div>
      <button onClick={() => setShowSettings(true)} className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#e8e4dc]/40 text-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.08] hover:text-[#e8e4dc]/70 hover:rotate-[30deg]">⚙️</button>
      {showDestiny && destinyQuota.ready && (
        <DestinyScroll
          onClose={() => setShowDestiny(false)}
          remainingSlots={destinyQuota.remaining}
          onCommitDraw={destinyQuota.commitDraw}
          excludeNames={destinyQuota.draws.map((d) => d.name)}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function Compass({ bestDir }: { bestDir: string }) {
  const { userHeading, setUserHeading } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [userDirText, setUserDirText] = useState('--');
  const [compassState, setCompassState] = useState<'idle' | 'requesting' | 'calibrating' | 'active'>('idle');
  const bestDeg = DIRS[bestDir] || 0;

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);

    if (!mobile) {
      setUserDirText('电脑端不可用');
      return;
    }

    const doe = DeviceOrientationEvent as any;
    if (typeof doe?.requestPermission === 'function') {
      setCompassState('idle');
      setUserDirText('点击启动罗盘');
    } else {
      setCompassState('calibrating');
      setUserDirText('正在校准…');
      startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserHeading]);

  const startListening = () => {
    setCompassState('calibrating');
    setUserDirText('正在校准…');

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let h: number | null = null;
      const anyE = e as any;
      if (anyE.webkitCompassHeading !== undefined) {
        h = anyE.webkitCompassHeading;
      } else if (e.alpha !== null) {
        h = 360 - e.alpha;
      }
      if (h !== null) {
        const heading = ((h % 360) + 360) % 360;
        setCompassState('active');
        setUserHeading(heading);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  const requestPermission = async () => {
    try {
      const doe = DeviceOrientationEvent as any;
      const result = await doe.requestPermission();
      if (result === 'granted') {
        startListening();
      } else {
        setCompassState('idle');
        setUserDirText('罗盘权限被拒绝 · 请在设置中开启');
      }
    } catch {
      setCompassState('idle');
      setUserDirText('罗盘启动失败 · 请重试');
    }
  };

  useEffect(() => {
    if (userHeading === null || !bestDir) return;
    const diff = Math.abs(userHeading - bestDeg);
    const md = Math.min(diff, Math.abs(diff - 360), Math.abs(diff + 360));
    let t = '';
    if (md < 12) t = '正对吉方 ✓';
    else if (md < 40) t = '偏向吉方';
    else if (md < 80) t = '调整方向';
    else if (md < 130) t = '背向吉方';
    else t = '正对反方';
    setUserDirText(`${Math.round(userHeading)}° · ${t}`);
  }, [userHeading, bestDeg, bestDir]);

  return (
    <div className="relative w-[200px]">
      {/* Compass face */}
      <div className="relative w-[200px] h-[200px]">
        <div className="w-full h-full rounded-full border-[1.5px] border-white/[0.1] relative bg-[#141e14]/25 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-[12%] left-[12%] right-[12%] bottom-[12%] rounded-full border border-white/[0.05]" />

          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * 360;
            const isMajor = i % 9 === 0;
            const isMid = i % 3 === 0 && !isMajor;
            const len = isMajor ? 4 : isMid ? 2.5 : 1.5;
            const color = isMajor ? 'rgba(255,255,255,0.15)' : isMid ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-[1px] origin-bottom pointer-events-none"
                style={{
                  height: '50%',
                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                  background: `linear-gradient(to top, transparent ${100 - len}%, ${color} ${100 - len}%)`,
                }}
              />
            );
          })}

          {/* Direction labels */}
          <div className="absolute top-[7%] left-1/2 -translate-x-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">北</div>
          <div className="absolute top-1/2 left-[93%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">东</div>
          <div className="absolute top-[93%] left-1/2 -translate-x-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">南</div>
          <div className="absolute top-1/2 left-[7%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">西</div>
          <div className="absolute top-[20%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">东北</div>
          <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">西北</div>
          <div className="absolute top-[80%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">东南</div>
          <div className="absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 text-[9px] text-[#e8e4dc]/20 tracking-[0.05em]">西南</div>

          {/* Best direction needle (green) */}
          <div
            className="absolute top-1/2 left-1/2 w-[2.5px] h-[38%] origin-bottom -translate-x-1/2 -translate-y-full transition-transform duration-[2s] z-[3]"
            style={{ transform: `translate(-50%, -100%) rotate(${bestDeg}deg)`, color: '#6b8f4a', filter: 'drop-shadow(0 0 6px currentColor)' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[12px] border-l-transparent border-r-transparent" style={{ borderBottomColor: '#6b8f4a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[25%] bg-white/[0.08]" />
          </div>

          {/* User heading needle (semi-transparent) */}
          {compassState === 'active' && userHeading !== null && (
            <div
              className="absolute top-1/2 left-1/2 w-[2px] h-[30%] origin-bottom -translate-x-1/2 -translate-y-full z-[2] transition-transform duration-300 ease-out"
              style={{ transform: `translate(-50%, -100%) rotate(${userHeading}deg)` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[10px] border-l-transparent border-r-transparent" style={{ borderBottomColor: 'rgba(232,228,220,0.45)' }} />
            </div>
          )}

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#141e14]/70 border-[1.5px] border-white/[0.2] z-[4]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-[#6b8f4a]" />
          </div>
        </div>
      </div>

      {/* User direction text */}
      <div className="text-center mt-3">
        <p className="text-[13px] text-[#e8e4dc]/30">你当前面向</p>
        <p className="text-sm text-[#e8e4dc]/70 mt-1">{userDirText}</p>
        {isMobile && compassState === 'idle' && (
          <button
            onClick={requestPermission}
            className="mt-2 px-4 py-1.5 rounded-full bg-[#6b8f4a]/10 border border-[#6b8f4a]/30 text-xs text-[#6b8f4a] hover:bg-[#6b8f4a]/20 cursor-pointer transition-all"
          >
            启动罗盘
          </button>
        )}
      </div>

      {/* Desktop notice */}
      {!isMobile && (
        <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-xs text-[#e8e4dc]/35 mb-1.5 flex items-center gap-1.5">
            <span>💻</span>
            <span>为什么电脑端无法使用指南针？</span>
          </div>
          <p className="text-xs text-[#e8e4dc]/25 leading-relaxed">
            指南针需要设备的<strong>磁力计/陀螺仪</strong>传感器，普通电脑没有这些硬件。请在<strong>手机浏览器</strong>中打开本页面，并授权"方向传感器"权限，即可实时查看你面向的方位。绿色指针始终指向今日吉方，当你的方向与绿针重合时，即为最佳朝向。
          </p>
        </div>
      )}
    </div>
  );
}
