import { useSettingsStore } from '@/stores/useSettingsStore';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { aiPoem, setAiPoem } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-[200] bg-[#09090b]/96 backdrop-blur-xl flex items-center justify-center p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[400px] p-7 rounded-[20px] bg-white/[0.02] border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="text-center text-[15px] tracking-[0.15em] text-[#e8e4dc]/60 mb-5">偏好</div>
        <p className="text-center text-xs text-[#e8e4dc]/35 leading-relaxed mb-6">
          服务端已配置 Kimi 时，开运指南会自动调用 AI。此处开关仅影响「寻地密语」的诗句：默认优先 AI（关闭则只用内置辞库）。
        </p>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-xs text-[#e8e4dc]/40 whitespace-nowrap">AI 生成景点密语</label>
          <button
            type="button"
            onClick={() => setAiPoem(!aiPoem)}
            className="relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              background: aiPoem ? 'rgba(140,200,90,0.25)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${aiPoem ? 'rgba(140,200,90,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <span
              className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300"
              style={{
                left: aiPoem ? '16px' : '2px',
                background: aiPoem ? '#6b8f4a' : 'rgba(255,255,255,0.4)',
              }}
            />
          </button>
          <span className="text-xs" style={{ color: aiPoem ? 'rgba(140,200,90,0.6)' : 'rgba(232,228,220,0.25)' }}>
            {aiPoem ? '开启' : '关闭'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-[14px] text-[13px] bg-white/[0.03] border border-white/[0.08] text-[#e8e4dc]/50 hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
