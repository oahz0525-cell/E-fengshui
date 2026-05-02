import { useEffect, useState } from 'react';

export function ScoreRing({ score, comment }: { score: number; comment: string }) {
  const [animated, setAnimated] = useState(0);
  const circ = 2 * Math.PI * 64;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="mb-8 text-center">
      <div className="relative w-[140px] h-[140px] mx-auto">
        <svg viewBox="0 0 140 140" width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle cx="70" cy="70" r="64" fill="none" stroke="#6b8f4a" strokeWidth="4" strokeDasharray={circ}
            strokeDashoffset={circ - (circ * animated / 100)} strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-[2s] ease-out" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extralight text-[#e8e4dc]">{score}</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[18px] text-[11px] text-[#e8e4dc]/35 whitespace-nowrap">电子风水指数</div>
      </div>
      <p className="text-sm text-[#e8e4dc]/50 mt-3">{comment}</p>
    </div>
  );
}
