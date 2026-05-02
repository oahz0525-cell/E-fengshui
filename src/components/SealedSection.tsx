import type { ReactNode } from 'react';

type Variant = 'sage' | 'mist';

const ringClass: Record<Variant, string> = {
  sage: 'from-[#a08060]/40 via-[#6b8f4a]/30 to-[#4a3a2e]/35',
  mist: 'from-[#7a8a98]/40 via-[#5a6a78]/30 to-[#2e3844]/35',
};

function sealFace(variant: Variant): React.CSSProperties {
  if (variant === 'mist') {
    return {
      background: 'radial-gradient(circle at 35% 30%, rgba(130,150,170,0.35), rgba(25,35,45,0.75))',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(100,125,145,0.45)',
    };
  }
  return {
    background: 'radial-gradient(circle at 35% 30%, rgba(190,150,115,0.4), rgba(45,35,28,0.78))',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(160,125,95,0.5)',
  };
}

/**
 * 可展开内容：装饰顶栏 + 圆形火漆章（无信封 SVG，布局稳定）
 */
export function SealedSection({
  title,
  subtitle,
  sealEmoji,
  isOpen,
  onOpen,
  children,
  variant = 'sage',
  className = '',
}: {
  title: string;
  subtitle?: string;
  sealEmoji: string;
  isOpen: boolean;
  onOpen: () => void;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const ring = ringClass[variant];

  return (
    <div className={`select-none ${className}`}>
      <div
        className={`rounded-[20px] border transition-colors duration-300 ${
          isOpen
            ? 'border-white/[0.1] bg-white/[0.03]'
            : 'cursor-pointer border-white/[0.07] bg-white/[0.02] hover:border-white/[0.11] hover:bg-white/[0.035]'
        }`}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full flex-col items-center gap-5 px-6 py-10 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#6b8f4a]/35 rounded-[20px]"
          >
            <div className="flex w-full max-w-[240px] items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <span className="text-[9px] tracking-[0.35em] text-[#e8e4dc]/25">封缄</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <div
              className={`relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br p-[2px] shadow-[0_10px_36px_rgba(0,0,0,0.4)] ${ring}`}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full text-[26px] leading-none"
                style={sealFace(variant)}
              >
                {sealEmoji}
              </div>
            </div>

            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#e8e4dc]/38">{title}</p>
              {subtitle ? <p className="mt-2 text-[11px] text-[#e8e4dc]/30">{subtitle}</p> : null}
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] tracking-[0.14em] text-[#e8e4dc]/28">展开</span>
              <span className="text-[9px] text-[#e8e4dc]/18">查看锦囊或预言正文</span>
            </div>
          </button>
        )}

        {isOpen && (
          <div className="animate-[sealedReveal_0.45s_ease-out_both]">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#e8e4dc]/40">{title}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[10px] tracking-[0.06em] text-[#e8e4dc]/45">
                <span className="text-[13px] leading-none">{sealEmoji}</span>
                已展开
              </span>
            </div>
            <div className="p-5">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
