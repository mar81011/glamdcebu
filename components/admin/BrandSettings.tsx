"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrandTitle } from "@/components/ui/BrandTitle";
import { DEFAULT_SITE_TITLE } from "@/lib/branding/defaults";

export function BrandSettings() {
  const [siteTitle, setSiteTitle] = useState(DEFAULT_SITE_TITLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteTitle(data.siteTitle ?? DEFAULT_SITE_TITLE);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleTitleSave() {
    const trimmed = siteTitle.trim();
    if (!trimmed) {
      setError("Site title cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteTitle: trimmed }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    setSiteTitle(data.siteTitle ?? trimmed);
    setMessage("Site title updated.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Site title</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Shown in the header, home page, and footer. Uses the brand script font
        with the Brows · Lashes · Nails tagline.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-brand-brown/10 bg-brand-cream/40 px-4 py-5 text-center">
            <BrandTitle title={siteTitle || DEFAULT_SITE_TITLE} size="md" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              Title text
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              maxLength={60}
              className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-brand-ink focus:border-brand-brown focus:outline-none"
            />
            <Button
              onClick={handleTitleSave}
              disabled={saving}
              className="mt-2 px-6 py-2 text-sm"
            >
              {saving ? "Saving…" : "Save title"}
            </Button>
          </div>

          {message && (
            <p className="text-sm font-medium text-green-800">{message}</p>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
