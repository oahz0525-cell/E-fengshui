import type { Environment, XiShen } from '@/types';

export function EnvAnalysis({ env, xi, dir }: { env: Environment; xi: XiShen; dir: string }) {
  const blocks: { icon: string; title: string; text: string }[] = [];
  const hour = new Date().getHours();

  if (env.waterDist < 400) blocks.push({ icon: '💧', title: '近水', text: `距水源仅${Math.round(env.waterDist)}m。${xi.xi.includes('水') ? '水气充沛，与你喜用神相合' : '水气旺盛，但你忌水，注意精力分散'}` });
  else if (env.waterDist < 900) blocks.push({ icon: '💧', title: '中距水源', text: `距水源${Math.round(env.waterDist)}m。水气适中。` });
  else blocks.push({ icon: '💧', title: '远水', text: `距水源${Math.round(env.waterDist)}m。${xi.xi.includes('水') ? '水气不足，建议桌面放一杯清水' : '远水无害'}` });

  if (env.parkDist < 350) blocks.push({ icon: '🌿', title: '近绿', text: `距绿地${Math.round(env.parkDist)}m。${xi.xi.includes('木') ? '木气得助，生机盎然' : '绿意盎然'}` });
  else if (env.parkDist > 800) blocks.push({ icon: '🌿', title: '远绿', text: `距绿地${Math.round(env.parkDist)}m。${xi.xi.includes('木') ? '木气不足，建议增加植物' : '与你无碍'}` });

  const heightOpenText = [
    `第${env.floor}层，相较地面降温约${env.altitudeTemp}°C，风速${env.windSpeed}m/s。`,
    env.floor >= 20
      ? '高层离地为远，阳气偏盛，宜静心收敛。'
      : env.floor >= 10
        ? '中层气场平稳。'
        : '低层接地气，阴平稳固。',
    env.openness > 0.6
      ? '周围开阔，阳气与视野俱畅。'
      : env.openness > 0.35
        ? '半开阔，气机与视野尚可。'
        : '建筑偏密，视野易受阻，气场易淤滞。',
    env.noiseLevel < 0.25
      ? '高处声环境偏静，利于专注。'
      : env.noiseLevel < 0.4
        ? '声环境温和。'
        : '仍有一定噪音干扰。',
  ].join('');

  blocks.push({
    icon: '🏔️',
    title: '高度与视野',
    text: heightOpenText,
  });

  blocks.push({
    icon: '🔊',
    title: '声环境',
    text: env.noiseLevel < 0.3 ? '环境静谧' : env.noiseLevel < 0.55 ? '偶有喧嚣' : '噪音较大，金气过旺',
  });

  return (
    <div className="bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl saturate-50 rounded-[20px] p-5 mb-6">
      <p className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/30 mb-4">场地诊断</p>
      {blocks.map((b, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-2.5">
          <div className="flex items-start gap-3">
            <span className="text-lg">{b.icon}</span>
            <div>
              <div className="text-[12px] text-[#e8e4dc]/35 mb-1.5 tracking-[0.1em]">{b.title}</div>
              <div className="text-sm text-[#e8e4dc]/70 leading-relaxed">{b.text}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="p-4 rounded-2xl bg-[#6b8f4a]/[0.05] border border-[#6b8f4a]/[0.15]">
        <div className="flex items-start gap-3">
          <span className="text-lg">🎯</span>
          <div>
            <div className="text-[12px] text-[#e8e4dc]/35 mb-1.5 tracking-[0.1em]">方位指引</div>
            <div className="text-sm text-[#e8e4dc]/70 leading-relaxed">今日最佳方位：<b className="text-[#6b8f4a]">{dir}</b>。此刻{hour >= 6 && hour <= 18 ? '阳光自东而来' : '月华西沉'}，{dir}向而坐可接引吉气。</div>
          </div>
        </div>
      </div>
    </div>
  );
}
