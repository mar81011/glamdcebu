"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_CONTACT,
  formatPhoneDisplay,
  mapsUrlFromAddress,
} from "@/lib/contact/defaults";

type ContactForm = {
  phone: string;
  address: string;
  instagram: string;
  facebookName: string;
  facebookLink: string;
};

function toForm(contact: {
  phone: string;
  phoneDisplay: string;
  address: string;
  instagramUrl: string;
  instagramLabel: string;
  facebookUrl: string;
  facebookLabel: string;
}): ContactForm {
  return {
    phone: contact.phoneDisplay || contact.phone,
    address: contact.address,
    instagram: contact.instagramLabel || contact.instagramUrl,
    facebookName: contact.facebookLabel,
    facebookLink: contact.facebookUrl,
  };
}

export function ContactSettings() {
  const [form, setForm] = useState<ContactForm>(toForm(DEFAULT_CONTACT));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.contact) {
          setForm(toForm(data.contact));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");

    const phoneDigits = form.phone.replace(/\D/g, "");
    const payload = {
      contact: {
        phone: phoneDigits,
        phoneDisplay: formatPhoneDisplay(phoneDigits || form.phone),
        address: form.address.trim(),
        mapsUrl: mapsUrlFromAddress(form.address),
        instagramUrl: form.instagram.trim(),
        instagramLabel: form.instagram.trim(),
        facebookUrl: form.facebookLink.trim(),
        facebookLabel: form.facebookName.trim(),
      },
    };

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save. Check phone, links, and try again.");
      return;
    }
    if (data.contact) setForm(toForm(data.contact));
    setMessage("Contact details updated. Changes appear on the homepage footer.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Footer contact info</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Edit the phone, location, Instagram, and Facebook shown at the bottom of
        the homepage.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="0966 551 8594"
            inputMode="tel"
          />

          <Field
            label="Location"
            value={form.address}
            onChange={(v) => updateField("address", v)}
            placeholder="South Ridge Residences Blk2 Lot 2"
          />

          <Field
            label="Instagram"
            value={form.instagram}
            onChange={(v) => updateField("instagram", v)}
            placeholder="@glam.d21"
            hint="Handle or full Instagram link"
          />

          <Field
            label="Facebook name"
            value={form.facebookName}
            onChange={(v) => updateField("facebookName", v)}
            placeholder="Christine Dela Calzada"
            hint="Name shown in the footer"
          />

          <Field
            label="Facebook link"
            value={form.facebookLink}
            onChange={(v) => updateField("facebookLink", v)}
            placeholder="https://facebook.com/your-page"
            hint="Full Facebook page link"
          />

          <Button onClick={save} disabled={saving} className="px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save contact info"}
          </Button>

          {message && (
            <p className="text-sm font-medium text-green-800">{message}</p>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-brand-ink">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-brand-subtle">{hint}</p>}
    </div>
  );
}
