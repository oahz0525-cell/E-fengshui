import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';
import { GOALS, STEMS, XI_SHEN } from '@/data/elements';
import { calcBazi } from '@/data/bazi';
import type { Goal, Stem } from '@/types';

/** 与首页水晶同色，用于意图发光字 */
const GOAL_ACCENT: Record<Goal, string> = {
  creation: '#7cb06a',
  study: '#4a90a4',
  sleep: '#b0926a',
  wealth: '#c9735a',
  emotion: '#8a9199',
  social: '#b0926a',
};

export function InputPage() {
  const navigate = useNavigate();
  const { goal, location, setLocation, setStem, setBazi, setFloor, floor } = useAppStore();
  const [mode, setMode] = useState<'wheel' | 'birth'>('wheel');
  const [pickName, setPickName] = useState('');
  const [pickEl, setPickEl] = useState('');
  const [showBazi, setShowBazi] = useState(false);
  const [bz, setBz] = useState({ yG:'--',yZ:'--',mG:'--',mZ:'--',dG:'--',dZ:'--',hG:'--',hZ:'--',dm:'' });
  const [manualLoc, setManualLoc] = useState(false);
  const [latStr, setLatStr] = useState('39.9042');
  const [lngStr, setLngStr] = useState('116.4074');
  const [locMsg, setLocMsg] = useState('');
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(0);

  const selectStem = (s: Stem) => {
    setStem(s.n, s.el);
    setPickName(s.n);
    setPickEl(`${s.el}${s.y ? '·阴' : '·阳'} · 喜${XI_SHEN[s.el].xi.join('、')}`);
  };

  const calc = () => {
    const r = calcBazi(year, month, day, hour);
    setBz({ ...r, dm: r.dm });
    setBazi(r, r.dm as any);
    setShowBazi(true);
  };

  const goResult = () => {
    const store = useAppStore.getState();
    if (store.stem && store.location) navigate('/report');
  };

  const canGo = pickName !== '' || bz.dm !== '';

  return (
    <div className="page active py-6">
      <div className="max-w-[520px] mx-auto px-5">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/35 mb-2">当前想要提升的方向</p>
          {goal ? (
            <h2
              className="text-[clamp(18px,4vw,24px)] font-normal tracking-[0.06em]"
              style={{
                color: GOAL_ACCENT[goal],
                textShadow: `0 0 18px ${GOAL_ACCENT[goal]}66, 0 0 36px ${GOAL_ACCENT[goal]}40, 0 0 3px ${GOAL_ACCENT[goal]}aa`,
              }}
            >
              {GOALS[goal]}
            </h2>
          ) : (
            <h2 className="text-[clamp(16px,4vw,21px)] font-normal text-[#e8e4dc]/35">--</h2>
          )}
        </div>

        {/* Location */}
        <div className="bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl saturate-50 rounded-[20px] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/35">你的方位</p>
            <span className="text-[13px] text-[#e8e4dc]/45">{location ? '已设定' : '未设定'}</span>
          </div>
          {location && !manualLoc && <p className="text-[13px] text-[#e8e4dc]/45">纬度 {location.lat.toFixed(4)}<br/>经度 {location.lng.toFixed(4)}</p>}
          {manualLoc && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input value={latStr} onChange={e => setLatStr(e.target.value)} className="bg-white/[0.06] border border-white/[0.12] rounded-xl px-3.5 py-3 text-sm text-[#e8e4dc] placeholder:text-[#e8e4dc]/25 outline-none focus:border-[#6b8f4a]/45" placeholder="纬度" />
              <input value={lngStr} onChange={e => setLngStr(e.target.value)} className="bg-white/[0.06] border border-white/[0.12] rounded-xl px-3.5 py-3 text-sm text-[#e8e4dc] placeholder:text-[#e8e4dc]/25 outline-none focus:border-[#6b8f4a]/45" placeholder="经度" />
            </div>
          )}
          {manualLoc && (
            <button
              type="button"
              onClick={() => {
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                  setLocMsg('经纬度格式不正确，请检查后再确认。');
                  return;
                }
                setLocation({ lat, lng });
                setLocMsg(`已使用手动坐标：${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6b8f4a]/[0.18] border border-[#6b8f4a]/35 text-xs text-[#e8e4dc]/90 hover:bg-[#6b8f4a]/[0.28] hover:border-[#6b8f4a]/45 cursor-pointer transition-all"
            >
              确认手动经纬度
            </button>
          )}
          <div className="mt-2">
            <button onClick={() => {
              setManualLoc(!manualLoc);
              setLocMsg('');
            }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-[#7cb06a]/85 hover:bg-[#6b8f4a]/[0.12] hover:border-[#6b8f4a]/30 cursor-pointer transition-all">
              {manualLoc ? '改回自动定位模式' : '无法定位？手动输入经纬度'}
            </button>
          </div>
          {!!locMsg && <p className="text-xs text-[#e8e4dc]/45 mt-2">{locMsg}</p>}
        </div>

        {/* Element */}
        <div className="bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl saturate-50 rounded-[20px] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/35">你的五行</p>
            <button onClick={() => setMode(mode === 'wheel' ? 'birth' : 'wheel')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-[#7cb06a]/85 hover:bg-[#6b8f4a]/[0.12] hover:border-[#6b8f4a]/30 cursor-pointer transition-all">
              {mode === 'wheel' ? '不知道？用生日推算' : '← 返回转盘选择'}
            </button>
          </div>
          {mode === 'wheel' ? (
            <WheelPicker onSelect={selectStem} selected={pickName} />
          ) : (
            <div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div><label className="text-[11px] text-[#e8e4dc]/40 mb-1 block">年</label>
                  <select value={year} onChange={e=>setYear(+e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-2 py-2 text-sm text-[#e8e4dc] outline-none focus:border-[#6b8f4a]/45">
                    {Array.from({length:101},(_,i)=>1925+i).map(y => <option key={y} value={y} className="bg-[#1a1a1c]">{y}</option>)}
                  </select></div>
                <div><label className="text-[11px] text-[#e8e4dc]/40 mb-1 block">月</label>
                  <select value={month} onChange={e=>setMonth(+e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-2 py-2 text-sm text-[#e8e4dc] outline-none focus:border-[#6b8f4a]/45">
                    {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m} className="bg-[#1a1a1c]">{m}月</option>)}
                  </select></div>
                <div><label className="text-[11px] text-[#e8e4dc]/40 mb-1 block">日</label>
                  <select value={day} onChange={e=>setDay(+e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-2 py-2 text-sm text-[#e8e4dc] outline-none focus:border-[#6b8f4a]/45">
                    {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d} className="bg-[#1a1a1c]">{d}日</option>)}
                  </select></div>
                <div><label className="text-[11px] text-[#e8e4dc]/40 mb-1 block">时</label>
                  <select value={hour} onChange={e=>setHour(+e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-2 py-2 text-sm text-[#e8e4dc] outline-none focus:border-[#6b8f4a]/45">
                    {Array.from({length:24},(_,i)=>i).map(h => <option key={h} value={h} className="bg-[#1a1a1c]">{h}:00</option>)}
                  </select></div>
              </div>
              <button type="button" onClick={calc} className="w-full py-3 rounded-[14px] bg-white/[0.06] border border-white/[0.12] text-[#e8e4dc]/90 text-sm hover:bg-white/[0.09] cursor-pointer transition-all">🔮 排盘</button>
              {showBazi && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div><p className="text-[11px] text-[#e8e4dc]/40">年柱</p><p className="text-sm text-[#e8e4dc]/75 mt-1">{bz.yG}{bz.yZ}</p></div>
                  <div><p className="text-[11px] text-[#e8e4dc]/40">月柱</p><p className="text-sm text-[#e8e4dc]/75 mt-1">{bz.mG}{bz.mZ}</p></div>
                  <div><p className="text-[11px] text-[#e8e4dc]/40">日柱</p><p className="text-sm text-[#e8e4dc]/75 mt-1">{bz.dG}{bz.dZ}</p></div>
                  <div><p className="text-[11px] text-[#e8e4dc]/40">时柱</p><p className="text-sm text-[#e8e4dc]/75 mt-1">{bz.hG}{bz.hZ}</p></div>
                </div>
              )}
            </div>
          )}
          {pickName && <div className="text-center mt-3"><span className="text-lg font-medium" style={{ color: STEMS.find(s=>s.n===pickName)?.c }}>{pickName}</span><span className="text-xs text-[#e8e4dc]/45 ml-2">{pickEl}</span></div>}
        </div>

        {/* Floor / Altitude */}
        <div className="bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl saturate-50 rounded-[20px] p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/35">所在楼层</p>
            <span className="text-[13px] text-[#e8e4dc]/45">影响温度与风速</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setFloor(Math.max(1, floor - 1))}
              className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#e8e4dc]/70 flex items-center justify-center text-lg cursor-pointer transition-all hover:bg-white/[0.1] hover:border-white/[0.18]"
            >
              −
            </button>
            <div className="text-center min-w-[60px]">
              <span className="text-[28px] font-extralight text-[#e8e4dc]/95">{floor}</span>
              <span className="text-[11px] text-[#e8e4dc]/45 ml-1">层</span>
            </div>
            <button
              type="button"
              onClick={() => setFloor(Math.min(99, floor + 1))}
              className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#e8e4dc]/70 flex items-center justify-center text-lg cursor-pointer transition-all hover:bg-white/[0.1] hover:border-white/[0.18]"
            >
              +
            </button>
          </div>
          <p className="text-[11px] text-[#e8e4dc]/35 text-center mt-2">
            楼层越高 · 温度略降 · 风速增加 · 噪音减弱
          </p>
        </div>

        <button type="button" onClick={goResult} disabled={!canGo}
          className="w-full py-4 rounded-[14px] bg-[#6b8f4a]/18 border border-[#6b8f4a]/35 text-[#e8e4dc]/95 text-sm flex items-center justify-center gap-2.5 transition-all hover:bg-[#6b8f4a]/28 hover:border-[#6b8f4a]/45 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
          开始诊断 →
        </button>
      </div>
    </div>
  );
}

/* ===== SVG Wheel Picker ===== */
function WheelPicker({ onSelect, selected }: { onSelect: (s: Stem) => void; selected: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const rotRef = useRef(0);
  const dragRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);

  const cx = 125, cy = 125, r = 85;

  const snap = useCallback(() => {
    const d = 36; // 360 / 10
    const n = ((rotRef.current % 360) + 360) % 360;
    const idx = Math.round(n / d) % 10;
    rotRef.current = idx * d;
    if (gRef.current) {
      gRef.current.setAttribute('transform', `rotate(${rotRef.current}, ${cx}, ${cy})`);
    }
    const si = (10 - idx) % 10;
    const st = STEMS[si];
    onSelect(st);
  }, [onSelect]);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    return Math.atan2(py - cy, px - cx) * 180 / Math.PI;
  }, []);

  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchIdRef.current = t.identifier;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    dragRef.current = true;
    startAngleRef.current = getAngle(clientX, clientY);
    startRotRef.current = rotRef.current;
    e.preventDefault();
  }, [getAngle]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    let clientX: number, clientY: number;
    if ('touches' in e) {
      const t = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
      if (!t) return;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    rotRef.current = startRotRef.current + (getAngle(clientX, clientY) - startAngleRef.current);
    if (gRef.current) {
      gRef.current.setAttribute('transform', `rotate(${rotRef.current}, ${cx}, ${cy})`);
    }
    e.preventDefault();
  }, [getAngle]);

  const handleUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = false;
    touchIdRef.current = null;
    snap();
  }, [snap]);

  // If pre-selected, set initial rotation
  const initialIdx = selected ? STEMS.findIndex(s => s.n === selected) : -1;
  if (initialIdx >= 0 && gRef.current && rotRef.current === 0) {
    const targetRot = ((10 - initialIdx) % 10) * 36;
    rotRef.current = targetRot;
    gRef.current.setAttribute('transform', `rotate(${targetRot}, ${cx}, ${cy})`);
  }

  return (
    <div className="relative w-[250px] h-[250px] mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-neutral-800/45 z-[5]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#141e14]/60 border-2 border-white/[0.2] z-[5]" />
      <svg
        ref={svgRef}
        viewBox="0 0 250 250"
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      >
        <circle cx={cx} cy={cy} r={121} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={96} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={70} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <g ref={gRef}>
          {STEMS.map((s, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            const isSel = selected === s.n;
            return (
              <g key={s.n}>
                <circle
                  cx={x} cy={y} r={isSel ? 22 : 18}
                  fill={isSel ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSel ? s.c : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isSel ? 2 : 1}
                  style={isSel ? { filter: `drop-shadow(0 0 10px ${s.c}50)` } : undefined}
                />
                <text
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSel ? s.c : 'rgba(232,228,220,0.45)'}
                  fontSize={isSel ? 15 : 13}
                  fontWeight={isSel ? 600 : 400}
                >
                  {s.n}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
