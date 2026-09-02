import { getShopContact } from "@/lib/contact/get-contact";

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

function ContactRow({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-brand-ink transition hover:bg-brand-cream"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-brown text-white">
        {icon}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[11px] font-medium text-brand-subtle">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold">{value}</span>
      </span>
    </a>
  );
}

export async function ContactFooter() {
  const contact = await getShopContact();

  return (
    <footer id="contact" className="brand-gradient-bg mt-10 rounded-3xl px-5 py-7">
      <h2 className="text-center font-serif text-xl text-white">Contact</h2>
      <div className="mx-auto mt-5 grid max-w-3xl gap-2.5 md:grid-cols-2">
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
    </footer>
  );
}
