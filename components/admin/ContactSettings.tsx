"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_CONTACT } from "@/lib/contact/defaults";

type ContactForm = {
  phone: string;
  phoneDisplay: string;
  address: string;
  mapsUrl: string;
  instagramUrl: string;
  instagramLabel: string;
  facebookUrl: string;
  facebookLabel: string;
};

export function ContactSettings() {
  const [form, setForm] = useState<ContactForm>({
    phone: DEFAULT_CONTACT.phone,
    phoneDisplay: DEFAULT_CONTACT.phoneDisplay,
    address: DEFAULT_CONTACT.address,
    mapsUrl: DEFAULT_CONTACT.mapsUrl,
    instagramUrl: DEFAULT_CONTACT.instagramUrl,
    instagramLabel: DEFAULT_CONTACT.instagramLabel,
    facebookUrl: DEFAULT_CONTACT.facebookUrl,
    facebookLabel: DEFAULT_CONTACT.facebookLabel,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.contact) {
          setForm({
            phone: data.contact.phone ?? DEFAULT_CONTACT.phone,
            phoneDisplay: data.contact.phoneDisplay ?? DEFAULT_CONTACT.phoneDisplay,
            address: data.contact.address ?? DEFAULT_CONTACT.address,
            mapsUrl: data.contact.mapsUrl ?? DEFAULT_CONTACT.mapsUrl,
            instagramUrl: data.contact.instagramUrl ?? DEFAULT_CONTACT.instagramUrl,
            instagramLabel:
              data.contact.instagramLabel ?? DEFAULT_CONTACT.instagramLabel,
            facebookUrl: data.contact.facebookUrl ?? DEFAULT_CONTACT.facebookUrl,
            facebookLabel:
              data.contact.facebookLabel ?? DEFAULT_CONTACT.facebookLabel,
          });
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
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: form }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    if (data.contact) setForm(data.contact);
    setMessage("Contact details updated.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Contact details</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Shown in the site footer and on the booking confirmation page.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Phone (for calling)"
              value={form.phone}
              onChange={(v) => updateField("phone", v)}
              placeholder="09665518594"
            />
            <Field
              label="Phone display"
              value={form.phoneDisplay}
              onChange={(v) => updateField("phoneDisplay", v)}
              placeholder="0966 551 8594"
            />
          </div>

          <Field
            label="Location"
            value={form.address}
            onChange={(v) => updateField("address", v)}
            placeholder="South Ridge Residences Blk2 Lot 2"
          />

          <Field
            label="Google Maps link"
            value={form.mapsUrl}
            onChange={(v) => updateField("mapsUrl", v)}
            placeholder="https://www.google.com/maps/..."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Instagram link"
              value={form.instagramUrl}
              onChange={(v) => updateField("instagramUrl", v)}
              placeholder="https://instagram.com/glam.d21"
            />
            <Field
              label="Instagram label"
              value={form.instagramLabel}
              onChange={(v) => updateField("instagramLabel", v)}
              placeholder="@glam.d21"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Facebook link"
              value={form.facebookUrl}
              onChange={(v) => updateField("facebookUrl", v)}
              placeholder="https://facebook.com/..."
            />
            <Field
              label="Facebook label"
              value={form.facebookLabel}
              onChange={(v) => updateField("facebookLabel", v)}
              placeholder="Christine Dela Calzada"
            />
          </div>

          <Button onClick={save} disabled={saving} className="px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save contact details"}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-brand-ink">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
      />
    </div>
  );
}
