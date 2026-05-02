import type { SubScores as SubScoresType, XiShen } from '@/types';

export function SubScores({ subs, xi }: { subs: SubScoresType; xi: XiShen }) {
  const items = [
    { k: 'wealth', l: '💰 财运', v: subs.wealth, c: xi.xi.includes('金') || xi.xi.includes('水') ? '#b0bec5' : '#d4a574' },
    { k: 'creative', l: '✨ 创作力', v: subs.creative, c: xi.xi.includes('木') || xi.xi.includes('水') ? '#6b8f4a' : '#4fc3f7' },
    { k: 'sleep', l: '☾ 睡眠', v: subs.sleep, c: xi.xi.includes('土') || xi.xi.includes('水') ? '#d4a574' : '#6b8f4a' },
    { k: 'social', l: '⚹ 社交', v: subs.social, c: xi.xi.includes('火') || xi.xi.includes('木') ? '#ff8a65' : '#d4a574' },
  ];

  return (
    <div className="bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl saturate-50 rounded-[20px] p-5 mb-6">
      <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/30 mb-4">分项能量</p>
      {items.map(it => (
        <div key={it.k} className="flex items-center gap-2.5 my-2">
          <div className="w-[60px] text-[13px] text-[#e8e4dc]/55 shrink-0">{it.l}</div>
          <div className="flex-1 h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-[1.5s] ease-out" style={{ width: `${it.v}%`, background: it.c }} />
          </div>
          <div className="w-8 text-right text-[13px] text-[#e8e4dc]/60 shrink-0">{Math.round(it.v)}</div>
        </div>
      ))}
    </div>
  );
}
