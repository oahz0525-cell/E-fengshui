import { useState, useEffect } from 'react';

const txts = ['感知天地气运', '读取五行磁场', '测算方位吉凶', '凝练今日指引'];

export function LoadingOverlay() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % txts.length), 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[100] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-[#6b8f4a]/15" />
        <div
          className="absolute -inset-3 rounded-full border border-[#6b8f4a]/30"
          style={{ animation: 'pulse-ring 2.5s ease-out infinite' }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(107,143,74,0.15) 0%, transparent 70%)',
            animation: 'sun-breathe 2.5s ease-in-out infinite',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#6b8f4a]/60" />
      </div>
      <p className="mt-8 text-xs text-[#e8e4dc]/30 tracking-[0.25em] min-h-[20px]">
        {txts[idx]}
      </p>
      <div className="flex gap-1.5 mt-4">
        {txts.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i === idx ? 'rgba(107,143,74,0.7)' : 'rgba(255,255,255,0.1)',
              transform: i === idx ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
