import type { ReactNode } from 'react';

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl saturate-50 rounded-[20px] p-5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] ${className}`}>
      {children}
    </div>
  );
}
