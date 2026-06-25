import { ReactNode } from "react";
import { getShopBranding } from "@/lib/branding/get-branding";
import { SiteHeader } from "@/components/ui/SiteHeader";

interface PageShellProps {
  children: ReactNode;
  backgroundImage?: string;
  showHeader?: boolean;
}

export async function PageShell({
  children,
  backgroundImage,
  showHeader = true,
}: PageShellProps) {
  const branding = await getShopBranding();

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
        {showHeader && <SiteHeader branding={branding} />}
        {children}
      </div>
    </div>
  );
}
