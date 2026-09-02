import Link from "next/link";

interface BackLinkProps {
  href?: string;
  label?: string;
}

export function BackLink({ href = "/", label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-brown/12 bg-white/70 px-4 py-2 text-sm font-medium text-brand-ink shadow-sm backdrop-blur-md transition hover:-translate-y-px hover:border-brand-brown/30 hover:bg-white"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
