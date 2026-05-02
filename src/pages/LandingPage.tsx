import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';
import { useLocation } from '@/hooks/useLocation';
import { GOALS } from '@/data/elements';
import { SettingsPanel } from '@/components/SettingsPanel';
import type { Goal } from '@/types';

const GOALS_CFG: { key: Goal; icon: string; color: string }[] = [
  { key: 'creation', icon: '✦', color: '#7cb06a' },
  { key: 'study', icon: '◈', color: '#4a90a4' },
  { key: 'sleep', icon: '☾', color: '#b0926a' },
  { key: 'wealth', icon: '◉', color: '#c9735a' },
  { key: 'emotion', icon: '♥', color: '#8a9199' },
  { key: 'social', icon: '✧', color: '#b0926a' },
];

const HALO_DURATION = 2400; // ms

type LocStatus = 'pending' | 'success' | 'failed';

export function LandingPage() {
  const navigate = useNavigate();
  const { setGoal, setLocation, location } = useAppStore();
  const [selected, setSelected] = useState<Goal | null>(null);
  const [locStatus, setLocStatus] = useState<LocStatus>('pending');
  const [locMsg, setLocMsg] = useState('正在感知你的方位…');
  const [showSettings, setShowSettings] = useState(false);

  const { startLocate } = useLocation(
    (loc) => {
      setLocation(loc);
      setLocStatus('success');
      setLocMsg(`方位已感知 · ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    },
    () => {
      setLocStatus('failed');
      setLocMsg('星图模糊中… 先用北京坐标开局，或稍后手动校准');
    }
  );

  useEffect(() => {
    startLocate();
  }, [startLocate]);

  const handleSelect = useCallback((g: Goal) => {
    setSelected(g);
    setGoal(g);
  }, [setGoal]);

  const handleGo = () => {
    if (selected && location) navigate('/diagnose');
  };

  return (
    <div className="page active flex-col items-center justify-center min-h-screen py-8">
      <div className="max-w-[520px] mx-auto px-5 w-full">
        {/* Title */}
        <div className="text-center mb-10 animate-[fadeUp_0.8s_ease-out_forwards]">
          <p className="text-[11px] tracking-[0.22em] uppercase text-neutral-500 mb-4">
            URBAN FENGSHUI ENERGY
          </p>
          <h1 className="text-[clamp(34px,9vw,60px)] font-extralight tracking-[0.12em] leading-tight">
            电子风水
          </h1>
          <p className="text-[13px] text-neutral-500 mt-4 tracking-[0.08em]">
            读取此刻的城市能量场
          </p>
        </div>

        {/* Location status */}
        <div className="text-center mb-10 animate-[fadeUp_0.8s_0.35s_ease-out_both]">
          <p
            className={`text-[13px] transition-all duration-500 ${
              locStatus === 'pending'
                ? 'loc-pending text-neutral-500'
                : locStatus === 'success'
                ? 'loc-success'
                : 'text-neutral-500'
            }`}
          >
            {locMsg}
          </p>
        </div>

        {/* Goal selection */}
        <div className="text-center">
          <p className="text-[11px] tracking-[0.18em] uppercase text-neutral-500 mb-6">
            选择今日想提升的能量
          </p>

          {/* 6 icons — equal columns so glyphs align regardless of font metrics */}
          <div className="mx-auto mb-8 grid w-full max-w-[420px] grid-cols-6 gap-x-2 px-1 sm:max-w-[480px] sm:gap-x-3">
            {GOALS_CFG.map((g) => {
              const isSel = selected === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => handleSelect(g.key)}
                  type="button"
                  className="flex min-w-0 flex-col items-center cursor-pointer select-none bg-transparent border-0 p-0 will-change-transform"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Icon crystal — fixed cell so ✦ ◈ ☾ etc. share one visual rhythm */}
                  <span
                    className="flex h-11 w-full items-center justify-center text-[26px] sm:h-12 sm:text-[30px] leading-none transition-transform duration-200 ease-out"
                    style={{
                      color: g.color,
                      transform: isSel ? 'scale(1.18)' : 'scale(1)',
                      filter: isSel
                        ? `drop-shadow(0 0 4px ${g.color}) drop-shadow(0 0 12px ${g.color}) drop-shadow(0 0 28px ${g.color}) drop-shadow(0 0 48px ${g.color}66)`
                        : `drop-shadow(0 0 2px ${g.color}44) drop-shadow(0 0 6px ${g.color}22)`,
                      opacity: isSel ? 1 : 0.5,
                      animation: isSel ? 'none' : `edgeHalo ${HALO_DURATION}ms ease-in-out infinite`,
                    }}
                  >
                    {g.icon}
                  </span>

                  {/* Label */}
                  <span
                    className="text-[11px] sm:text-[12px] tracking-[0.08em] mt-2.5 transition-all duration-200 ease-out overflow-hidden whitespace-nowrap"
                    style={{
                      color: `${g.color}cc`,
                      maxHeight: isSel ? '24px' : '0px',
                      opacity: isSel ? 1 : 0,
                      transform: isSel ? 'translateY(0)' : 'translateY(-4px)',
                    }}
                  >
                    {GOALS[g.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGo}
            disabled={!selected || !location}
            className="w-full py-4 rounded-[14px] bg-white/65 border border-neutral-400/30 text-neutral-900/85 text-sm flex items-center justify-center gap-2.5 transition-all hover:bg-white/85 hover:border-neutral-400/45 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer animate-[staggerUp_0.6s_0.6s_ease-out_both]"
          >
            进入诊断 →
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-white/70 border border-neutral-400/30 text-neutral-500 text-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/85 hover:text-neutral-700 hover:rotate-[30deg]"
      >
        ⚙️
      </button>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
