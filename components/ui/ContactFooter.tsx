import { getShopBranding } from "@/lib/branding/get-branding";
import { getShopContact } from "@/lib/contact/get-contact";
import { BrandTitle } from "@/components/ui/BrandTitle";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17" cy="7" r="0.75" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M14 8.5V7a2 2 0 0 1 2-2h1.5V3H16a4.5 4.5 0 0 0-4.5 4.5V8.5H10v2.75h1.5V21h2.75v-9.75H17V8.5h-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ContactRowProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}

function ContactRow({ href, icon, label, value, external }: ContactRowProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-brand-cream px-4 py-3 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="brand-gradient-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm">
        {icon}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[10px] font-bold tracking-[0.16em] text-brand-subtle uppercase">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-brand-ink">
          {value}
        </span>
      </span>
    </a>
  );
}

export async function ContactFooter() {
  const branding = await getShopBranding();
  const contact = await getShopContact();

  return (
    <footer
      id="contact"
      className="brand-gradient-bg mt-10 rounded-3xl px-5 pt-10 pb-9 shadow-[0_8px_30px_rgba(107,76,59,0.2)]"
    >
      <div className="mx-auto mb-6 h-0.5 max-w-[160px] rounded-full bg-brand-cream/50" />

      <div className="text-center">
        <BrandTitle title={branding.siteTitle} size="md" light />
        <div className="mx-auto mt-2 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-brand-cream/60" />
          <span className="text-[10px] text-brand-cream">◆</span>
          <span className="h-px w-8 bg-brand-cream/60" />
        </div>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.25em] text-brand-cream uppercase">
          Cebu · Beauty &amp; Nails
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl gap-2.5 md:grid-cols-2">
        <ContactRow
          href={`tel:${contact.phone}`}
          icon={<PhoneIcon />}
          label="Phone"
          value={contact.phoneDisplay}
        />
        <ContactRow
          href={contact.mapsUrl}
          icon={<PinIcon />}
          label="Location"
          value={contact.address}
          external
        />
        <ContactRow
          href={contact.instagramUrl}
          icon={<InstagramIcon />}
          label="Instagram"
          value={contact.instagramLabel}
          external
        />
        <ContactRow
          href={contact.facebookUrl}
          icon={<FacebookIcon />}
          label="Facebook"
          value={contact.facebookLabel}
          external
        />
      </div>

      <p className="mt-7 text-center text-[10px] tracking-wide text-brand-cream/80">
        © {new Date().getFullYear()} {branding.siteTitle} · All rights reserved
      </p>
    </footer>
  );
}
