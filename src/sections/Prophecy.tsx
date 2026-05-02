import { useEffect, useState } from 'react';
import type { XiShen } from '@/types';
import { trpc } from '@/providers/trpc';
import { SealedSection } from '@/components/SealedSection';
import {
  AI_CLIENT_TIMEOUT_MS,
  AI_RETRY_DELAY_MS,
  AI_RETRY_ON_TIMEOUT,
} from '@/config/aiClient';
import { pickLocalProphecy } from '@/data/localAiFallback';
import { callAiMutation } from '@/utils/callAiMutation';

export function Prophecy({
  xi,
  lat,
  lng,
  forecastDetail,
  cityHint,
  stem,
  floor,
  goalKey,
}: {
  xi: XiShen;
  lat: number;
  lng: number;
  forecastDetail: string;
  cityHint: string;
  stem: string;
  floor: number;
  goalKey: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: fetchProphecy } = trpc.ai.prophecy.useMutation();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'ai' | 'local' | null>(null);
  const [provider, setProvider] = useState<'kimi' | 'deepseek' | 'openai' | 'none'>('none');
  const [advice, setAdvice] = useState('');
  const [dir, setDir] = useState('东');
  const [time, setTime] = useState('09:00-11:00');
  const [itemIcon, setItemIcon] = useState('✨');
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  /* fetchProphecy 故意不入依赖，避免 trpc mutation 引用变化导致重复请求 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await callAiMutation(
          () =>
            fetchProphecy({
              xi: xi.xi.map(String),
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
        setProvider((r.provider as 'kimi' | 'deepseek' | 'openai' | 'none') || 'none');
        const b = r.block;
        if (b && b.advice.length >= 8) {
          setSource('ai');
          setAdvice(b.advice);
          setDir(b.dir);
          setTime(b.time);
          setItemIcon(b.itemEmoji || '✨');
          setItemName(b.itemName);
          setItemDesc(b.itemDesc);
        } else {
          applyLocal();
        }
      } catch {
        if (!cancelled) applyLocal();
      }
      if (!cancelled) setLoading(false);
    })();

    function applyLocal() {
      const p = pickLocalProphecy({
        xi: xi.xi.map(String),
        lat,
        lng,
        stem,
        floor,
        goalKey,
        cityHint,
        forecastDetail,
      });
      setSource('local');
      setProvider('none');
      setAdvice(p.advice);
      setDir(p.dir);
      setTime(p.time);
      setItemIcon(p.itemIcon);
      setItemName(p.itemName);
      setItemDesc(p.itemDesc);
    }

    return () => {
      cancelled = true;
    };
  }, [cityHint, floor, forecastDetail, goalKey, lat, lng, stem, xi.xi.join(',')]);

  const subtitle =
    source === 'ai'
      ? `● ${provider === 'kimi' ? 'Kimi' : provider === 'deepseek' ? 'DeepSeek' : provider === 'openai' ? 'OpenAI' : 'AI'} 执笔`
      : source === 'local'
        ? '本地预言（含地域·意图）'
        : loading
          ? '…'
          : '…';

  return (
    <SealedSection
      className="mb-10"
      title="明日预言"
      subtitle={subtitle}
      sealEmoji="🔮"
      variant="mist"
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
    >
      {loading && <p className="text-[13px] text-[#e8e4dc]/40 text-center py-3">正在请教明日气场…</p>}
      <p className="text-sm text-[#e8e4dc]/70 mb-4 leading-relaxed">{advice}</p>
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-white/[0.02]">
          <div className="text-[12px] text-[#e8e4dc]/35 mb-1">明日最佳方位</div>
          <div className="text-lg font-medium text-[#7cb06a]">{dir}</div>
        </div>
        <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-white/[0.02]">
          <div className="text-[12px] text-[#e8e4dc]/35 mb-1">开运时段</div>
          <div className="text-sm text-[#e8e4dc]/70">{time}</div>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-white/[0.02]">
        <p className="text-[12px] text-[#e8e4dc]/35 mb-1.5">明日随身物品</p>
        <div className="flex items-center gap-3">
          <span className="text-[28px]">{itemIcon}</span>
          <div>
            <p className="text-sm text-[#e8e4dc]/70">
              <b>{itemName}</b>
            </p>
            <p className="text-[12px] text-[#e8e4dc]/30 mt-0.5">{itemDesc}</p>
          </div>
        </div>
      </div>
    </SealedSection>
  );
}
