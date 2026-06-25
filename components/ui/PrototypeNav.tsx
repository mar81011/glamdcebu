"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SCREENS = [
  { href: "/", label: "Home" },
  { href: "/services/lashes-brows", label: "Lashes & Brows" },
  { href: "/services/nails", label: "Nails" },
  { href: "/book", label: "Book" },
  { href: "/calendar", label: "Schedule Overview" },
  { href: "/book/confirm", label: "Confirmation" },
  { href: "/admin/login", label: "Admin Login" },
  { href: "/admin", label: "Admin Calendar" },
];

export function PrototypeNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <nav className="mb-1 max-h-[70vh] w-52 overflow-y-auto rounded-2xl border border-brand-brown/15 bg-white p-2 shadow-xl">
          <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-brand-muted uppercase">
            All screens
          </p>
          {SCREENS.map((screen) => {
            const active = pathname === screen.href;
            return (
              <Link
                key={screen.href}
                href={screen.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "btn-gradient font-semibold text-white"
                    : "text-brand-ink hover:bg-brand-cream"
                }`}
              >
                {screen.label}
              </Link>
            );
          })}
        </nav>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-gradient flex h-12 w-12 items-center justify-center rounded-full text-lg text-white shadow-lg"
        aria-label="Open prototype screen menu"
      >
        {open ? "✕" : "☰"}
      </button>
    </div>
  );
}
