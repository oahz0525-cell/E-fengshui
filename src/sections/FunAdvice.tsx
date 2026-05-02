import { useEffect, useState } from 'react';
import type { XiShen, Element } from '@/types';
import { trpc } from '@/providers/trpc';
import { SealedSection } from '@/components/SealedSection';

const ADVICE_POOL = [
  { icon: '🌿', text: '桌面上放一盆薄荷或绿萝，工作前摸三下叶子。这是你今天的微型森林，触叶即安。' },
  { icon: '🪟', text: '试试把座位挪到窗边，让自然光落在左手边。光是最好的闹钟，也是最温柔的监督员。' },
  { icon: '🫗', text: '左手边放一杯水，留三分之一不要喝完。让它慢慢蒸发，像一个小小的计时器提醒你休息。' },
  { icon: '🌅', text: '电脑壁纸换成有天空或树林的照片。每次切屏都像推开一扇窗，深呼吸一次再开始工作。' },
  { icon: '🕯️', text: '点一支普通蜡烛放在角落，让它自然烧完。火光跳动的时候，人的思绪也会跟着慢下来。' },
  { icon: '🪨', text: '口袋里放一块路边捡的小石头。今天遇事不决时握住它三秒，沉稳是传染的。' },
  { icon: '🧭', text: '椅子往吉方偏一点点，不用太正。风水讲究微偏则活，坐下时先深呼吸一次再开工。' },
  { icon: '🧦', text: '今天穿一双你最喜欢的袜子。舒服从脚开始，气场也是。' },
  { icon: '🍵', text: '喝一口水含在嘴里数七下再咽。不为什么，只是给自己一个暂停的理由。' },
  { icon: '🪑', text: '坐下之前用手掌贴一下桌面，掌心朝下停三秒。再忙，也别忘了你和这张桌子是一伙的。' },
];

export function FunAdvice({
  xi,
  goalLabel,
  el,
  lat,
  lng,
  weatherLabel,
  forecastDetail,
  cityHint,
  stem,
  floor,
  goalKey,
}: {
  xi: XiShen;
  goalLabel: string;
  el: Element;
  lat: number;
  lng: number;
  weatherLabel: string;
  /** Open-Meteo 等真实预报摘要，与 weatherLabel 同时给模型 */
  forecastDetail: string;
  cityHint: string;
  stem: string;
  floor: number;
  goalKey: string;
}) {
  const { mutateAsync } = trpc.ai.funAdvice.useMutation();
  const [advices, setAdvices] = useState<{ icon: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<'ai' | 'local' | null>(null);
  const [provider, setProvider] = useState<'kimi' | 'deepseek' | 'openai' | 'none'>('none');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await mutateAsync({
          el,
          xi: xi.xi.map((x) => String(x)),
          goal: goalLabel,
          weather: weatherLabel,
          lat,
          lng,
          stem,
          floor,
          goalKey,
          cityHint: cityHint || undefined,
          forecastDetail: forecastDetail || undefined,
        });
        if (cancelled) return;
        const lines = r.lines;
        setProvider((r.provider as 'kimi' | 'deepseek' | 'openai' | 'none') || 'none');
        if (lines && lines.length >= 1) {
          setSource('ai');
          setAdvices(
            lines.map((l) => {
              const m = l.match(/([\u{1F300}-\u{1F9FF}])/u);
              return {
                icon: m ? m[1] : '✨',
                text: l.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/^[^\w\u4e00-\u9fff]*/, '').trim(),
              };
            }),
          );
        } else {
          const pool = [...ADVICE_POOL].sort(() => Math.random() - 0.5);
          setSource('local');
          setProvider('none');
          setAdvices(pool.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          const pool = [...ADVICE_POOL].sort(() => Math.random() - 0.5);
          setSource('local');
          setProvider('none');
          setAdvices(pool.slice(0, 3));
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [el, floor, goalKey, goalLabel, lat, lng, cityHint, forecastDetail, mutateAsync, stem, weatherLabel, xi.xi]);

  const subtitle =
    source === 'ai'
      ? `● ${provider === 'kimi' ? 'Kimi' : provider === 'deepseek' ? 'DeepSeek' : provider === 'openai' ? 'OpenAI' : 'AI'} 解读`
      : source === 'local'
        ? '内置锦囊'
        : '…';

  return (
    <SealedSection
      className="mb-6"
      title="今日开运指南"
      subtitle={subtitle}
      sealEmoji="📜"
      variant="sage"
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
    >
      {loading && (
        <p className="text-[13px] text-[#7cb06a]/50 text-center py-4">正在生成开运指南…</p>
      )}
      {advices.map((a, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-2 transition-all hover:bg-white/[0.05] hover:border-white/[0.1] hover:translate-x-[3px]"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-[22px] shrink-0">{a.icon}</span>
            <p className="text-sm text-[#e8e4dc]/70 leading-relaxed">{a.text}</p>
          </div>
        </div>
      ))}
    </SealedSection>
  );
}
