import { ReactNode } from "react";

interface PillBadgeProps {
  children: ReactNode;
}

export function PillBadge({ children }: PillBadgeProps) {
  return (
    <div className="inline-block rounded-full border border-brand-brown/10 bg-white px-8 py-2.5 shadow-md">
      <span className="font-serif text-lg tracking-[0.2em] text-brand-ink uppercase">
        {children}
      </span>
    </div>
  );
}
