import Link from "next/link";

interface BackLinkProps {
  href?: string;
  label?: string;
}

export function BackLink({ href = "/", label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-brown/15 bg-white px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:border-brand-brown/30 hover:shadow"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
