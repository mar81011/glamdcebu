import { ReactNode } from "react";

interface PillBadgeProps {
  children: ReactNode;
}

export function PillBadge({ children }: PillBadgeProps) {
  return (
    <div className="inline-block rounded-full border border-brand-brown/12 bg-white/80 px-7 py-2.5 shadow-sm backdrop-blur-md">
      <span className="font-serif text-sm tracking-[0.28em] text-brand-ink uppercase">
        {children}
      </span>
    </div>
  );
}
