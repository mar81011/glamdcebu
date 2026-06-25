"use client";

import { ReactNode } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { DEFAULT_BRANDING } from "@/lib/branding/defaults";

interface ClientPageShellProps {
  children: ReactNode;
  backgroundImage?: string;
  showHeader?: boolean;
}

export function ClientPageShell({
  children,
  backgroundImage,
  showHeader = true,
}: ClientPageShellProps) {
  return (
    <div className="relative min-h-screen bg-brand-cream">
      {backgroundImage && (
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-[0.12]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden
        />
      )}
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 md:max-w-3xl md:px-6 md:py-8 lg:max-w-5xl lg:px-8 lg:py-10 xl:max-w-6xl">
        {showHeader && <SiteHeader branding={DEFAULT_BRANDING} />}
        {children}
      </div>
    </div>
  );
}
