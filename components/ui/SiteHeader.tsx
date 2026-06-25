"use client";

import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import type { ShopBranding } from "@/lib/branding/defaults";

const NAV_LINKS = [
  { href: "/services/lashes-brows", label: "Lashes & Brows" },
  { href: "/services/nails", label: "Nails" },
  { href: "/book", label: "Book" },
  { href: "/calendar", label: "Schedule" },
];

export function SiteHeader({ branding }: { branding: ShopBranding }) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-brown/10 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
        <BrandMark branding={branding} size="md" />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="ml-2 rounded-full border border-brand-brown/20 px-3 py-2 text-sm font-medium text-brand-subtle transition hover:border-brand-brown/40 hover:text-brand-ink"
          >
            Admin login
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/book"
            className="btn-gradient rounded-full px-4 py-2 text-xs font-semibold text-white"
          >
            Book Now
          </Link>
        </div>
      </div>

      <nav
        className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden"
        aria-label="Quick links"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-brand-brown/15 bg-white px-3 py-1.5 text-xs font-medium text-brand-muted shadow-sm transition hover:border-brand-brown/30 hover:text-brand-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
