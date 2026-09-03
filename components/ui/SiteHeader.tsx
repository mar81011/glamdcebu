import { BrandMark } from "@/components/ui/BrandMark";
import type { ShopBranding } from "@/lib/branding/defaults";

export function SiteHeader({ branding }: { branding: ShopBranding }) {
  return (
    <header className="mb-5 md:mb-6">
      <div className="flex items-center justify-center">
        <BrandMark branding={branding} size="nav" />
      </div>
    </header>
  );
}
