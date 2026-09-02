"use client";

import { ReactNode } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { DEFAULT_BRANDING } from "@/lib/branding/defaults";

interface ClientPageShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function ClientPageShell({
  children,
  showHeader = true,
}: ClientPageShellProps) {
  return (
    <div className="page-atmosphere min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-5 md:max-w-3xl md:px-6 md:py-8 lg:max-w-5xl lg:px-8 lg:py-10">
        {showHeader && <SiteHeader branding={DEFAULT_BRANDING} />}
        {children}
      </div>
    </div>
  );
}
