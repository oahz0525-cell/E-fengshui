import { useEffect, useState } from 'react';
import type { XiShen } from '@/types';
import { hash } from '@/utils/hash';
import { trpc } from '@/providers/trpc';
import { SealedSection } from '@/components/SealedSection';

const ITEM_POOL = [
  { icon: '🪵', name: '木质物件', desc: '一块木头的手感，是任何塑料都给不了的踏实。' },
  { icon: '🔴', name: '红色小物', desc: '不用大面积，一点点就够了——是给自己的一个小标记。' },
  { icon: '🏺', name: '陶瓷物件', desc: '泥土烧出来的东西，自带安定的气质。' },
  { icon: '🔑', name: '金属钥匙扣', desc: '金属的声音和重量，是日常生活中最容易忽略的质感。' },
  { icon: '🧊', name: '透明玻璃物', desc: '玻璃的通透提醒你：有时候看得清，不如看得淡。' },
  { icon: '📿', name: '手串或项链', desc: '贴身之物在替你说话，选一个今天想戴在身上的。' },
  { icon: '🪶', name: '羽毛或绒毛', desc: '轻的东西最讲究平衡，带一根羽毛在身边，提醒自己放松。' },
  { icon: '📖', name: '一本纸质书', desc: '不用读完，带在身边就行。书的气场会潜移默化地影响你。' },
  { icon: '🌿', name: '干花或香叶', desc: '植物的残余香气，是自然界最小的安慰剂。' },
  { icon: '💎', name: '水晶或矿石', desc: '不用管功效，选一个你今天看着顺眼的。喜欢就是最好的能量。' },
];

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
        const r = await fetchProphecy({
          xi: xi.xi.map(String),
          lat,
          lng,
          stem,
          floor,
          goalKey,
          cityHint: cityHint || undefined,
          forecastDetail: forecastDetail || undefined,
        });
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
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const h = hash(`${lat.toFixed(4)},${lng.toFixed(4)},${tomorrow.getMonth() + 1},${tomorrow.getDate()}`);
      const dirs = ['东', '南', '西', '北', '东南', '西北'];
      setSource('local');
      setProvider('none');
      setDir(dirs[h % 6]);
      const hour = new Date().getHours();
      setTime(hour < 12 ? '13:00-15:00' : '07:00-09:00');
      const item = ITEM_POOL[(h + 123) % ITEM_POOL.length];
      setItemIcon(item.icon);
      setItemName(item.name);
      setItemDesc(item.desc);
      if (xi.xi.includes('水')) setAdvice('明天有雨则水气最旺。带一把透明伞出门，雨水落在伞面上的声音是你的开运BGM。');
      else if (xi.xi.includes('火')) setAdvice('明天晴朗则阳气充沛。早起晒太阳15分钟，面向南方，让阳光穿透你的眉心。');
      else if (xi.xi.includes('木')) setAdvice('明天有风则木气动摇。风是木的信使，适合传递信息、投递简历、发布作品。');
      else if (xi.xi.includes('金')) setAdvice('明天落雪则金气凝结。适合盘点资产、清理债务、断舍离。');
      else setAdvice('明日气场平稳，顺势而为即可。');
    }

    return () => {
      cancelled = true;
    };
  }, [cityHint, floor, forecastDetail, goalKey, lat, lng, stem, xi.xi.join(',')]);

  const subtitle =
    source === 'ai'
      ? `● ${provider === 'kimi' ? 'Kimi' : provider === 'deepseek' ? 'DeepSeek' : provider === 'openai' ? 'OpenAI' : 'AI'} 执笔`
      : source === 'local'
        ? '内置模版'
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
