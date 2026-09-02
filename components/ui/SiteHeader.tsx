import { BrandMark } from "@/components/ui/BrandMark";
import type { ShopBranding } from "@/lib/branding/defaults";

export function SiteHeader({ branding }: { branding: ShopBranding }) {
  return (
    <header className="mb-5 md:mb-6">
      <div className="flex items-center justify-center rounded-2xl border border-brand-brown/10 bg-white px-4 py-2.5 md:px-5">
        <BrandMark branding={branding} size="nav" />
      </div>
    </header>
  );
}
