import { useEffect, useState } from 'react';
import type { XiShen, Element } from '@/types';
import { trpc } from '@/providers/trpc';
import { SealedSection } from '@/components/SealedSection';
import {
  AI_CLIENT_TIMEOUT_MS,
  AI_RETRY_DELAY_MS,
  AI_RETRY_ON_TIMEOUT,
} from '@/config/aiClient';
import { pickLocalFunAdvices } from '@/data/localAiFallback';
import { callAiMutation } from '@/utils/callAiMutation';

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
        const r = await callAiMutation(
          () =>
            mutateAsync({
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
            }),
          {
            timeoutMs: AI_CLIENT_TIMEOUT_MS,
            retriesOnTimeout: AI_RETRY_ON_TIMEOUT,
            retryDelayMs: AI_RETRY_DELAY_MS,
          },
        );
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
          setSource('local');
          setProvider('none');
          setAdvices(
            pickLocalFunAdvices({
              el,
              xi: xi.xi.map(String),
              goalLabel,
              goalKey,
              cityHint,
              stem,
              lat,
              lng,
              weatherLabel,
            }),
          );
        }
      } catch {
        if (!cancelled) {
          setSource('local');
          setProvider('none');
          setAdvices(
            pickLocalFunAdvices({
              el,
              xi: xi.xi.map(String),
              goalLabel,
              goalKey,
              cityHint,
              stem,
              lat,
              lng,
              weatherLabel,
            }),
          );
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
        ? '本地锦囊（含坐标·意图）'
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
