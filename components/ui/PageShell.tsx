import { ReactNode } from "react";
import { getShopBranding } from "@/lib/branding/get-branding";
import { SiteHeader } from "@/components/ui/SiteHeader";

interface PageShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export async function PageShell({
  children,
  showHeader = true,
}: PageShellProps) {
  const branding = await getShopBranding();

  return (
    <div className="page-atmosphere min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-5 md:max-w-3xl md:px-6 md:py-8 lg:max-w-5xl lg:px-8 lg:py-10">
        {showHeader && <SiteHeader branding={branding} />}
        {children}
      </div>
    </div>
  );
}
