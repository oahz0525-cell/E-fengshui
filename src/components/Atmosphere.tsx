import { useEffect, useRef } from 'react';

export function Atmosphere() {
  const grassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = grassRef.current;
    if (!g) return;
    for (let i = 0; i < 30; i++) {
      const e = document.createElement('div');
      const h = 70 + Math.random() * 210;
      const l = -8 + Math.random() * 116;
      const w = 1.5 + Math.random() * 3;
      // Sage / 苔绿，与背景光斑同色系、略深
      const hue = 42 + Math.random() * 14;
      const sat = 14 + Math.random() * 12;
      const lit = 8 + Math.random() * 10;
      const an = ['sway-a', 'sway-b', 'sway-c'][Math.floor(Math.random() * 3)];
      const du = 3 + Math.random() * 4;
      const de = Math.random() * 4;
      e.style.cssText = `position:absolute;bottom:0;left:${l}%;height:${h}px;width:${w}px;border-radius:3px 3px 0 0;transform-origin:bottom center;opacity:${0.12 + Math.random() * 0.28};animation:${an} ${du}s ease-in-out ${de}s infinite;background:linear-gradient(to top,hsl(${hue},${sat}%,${lit}%) 0%,hsl(${hue + 2},${Math.min(28, sat + 6)}%,${lit + 5}%) 55%,transparent 100%);z-index:${Math.floor(1 + Math.random() * 5)};filter:blur(0.3px);`;
      g.appendChild(e);
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050506] via-[#070708] via-45% via-[#09090b] via-72% to-[#0b0b0e]" />
        <div ref={grassRef} className="absolute bottom-0 left-[-10%] right-[-10%] h-[38vh] pointer-events-none" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.07]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 120px 180px at 18% 22%,rgba(145,158,102,0.35) 0%,transparent 72%)',
            'radial-gradient(ellipse 80px 140px at 48% 18%,rgba(130,145,92,0.22) 0%,transparent 72%)',
            'radial-gradient(ellipse 140px 100px at 78% 28%,rgba(125,138,88,0.2) 0%,transparent 72%)',
            'radial-gradient(ellipse 60px 110px at 88% 48%,rgba(118,132,82,0.16) 0%,transparent 72%)',
            'radial-gradient(ellipse 90px 130px at 32% 42%,rgba(132,145,90,0.18) 0%,transparent 72%)',
          ].join(','),
          animation: 'dappled-drift 18s ease-in-out infinite',
        }}
      />
      <div
        className="fixed z-[1] pointer-events-none w-[520px] h-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle,rgba(155,165,118,0.06) 0%,rgba(120,130,95,0.03) 32%,rgba(70,75,55,0.015) 58%,transparent 78%)',
          filter: 'blur(120px)',
          animation: 'sun-breathe 10s ease-in-out infinite',
          top: '10%',
          left: '35%',
        }}
      />
    </>
  );
}
