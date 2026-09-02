"use client";

import Link from "next/link";
import type { ShopBranding } from "@/lib/branding/defaults";
import { BrandTitle } from "@/components/ui/BrandTitle";

interface BrandMarkProps {
  branding: ShopBranding;
  href?: string;
  size?: "nav" | "sm" | "md" | "lg";
  showTagline?: boolean;
}

const sizeMap = {
  nav: "nav" as const,
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
};

export function BrandMark({
  branding,
  href = "/",
  size = "md",
  showTagline = false,
}: BrandMarkProps) {
  const inner = (
    <BrandTitle
      title={branding.siteTitle}
      size={sizeMap[size]}
      showTagline={showTagline}
      className="items-center"
    />
  );

  if (!href) return inner;

  return (
    <Link href={href} className="transition hover:opacity-80">
      {inner}
    </Link>
  );
}
