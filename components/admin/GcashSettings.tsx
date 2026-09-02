"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { DEFAULT_GCASH_INSTRUCTIONS } from "@/lib/payment/defaults";

export function GcashSettings() {
  const [number, setNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [instructions, setInstructions] = useState(DEFAULT_GCASH_INSTRUCTIONS);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setNumber(data.gcash?.number ?? "");
        setAccountName(data.gcash?.accountName ?? "");
        setInstructions(data.gcash?.instructions ?? DEFAULT_GCASH_INSTRUCTIONS);
        setQrUrl(data.gcash?.qrUrl ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gcash: { number, accountName, instructions },
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    setNumber(data.gcash?.number ?? number);
    setAccountName(data.gcash?.accountName ?? accountName);
    setInstructions(data.gcash?.instructions ?? instructions);
    setMessage("GCash details updated. Guests will see these on booking.");
  }

  async function uploadQr(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/settings/gcash-qr", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not upload QR");
      return;
    }
    setQrUrl(data.qrUrl ?? "");
    setMessage("GCash QR uploaded.");
  }

  async function removeQr() {
    setError("");
    setMessage("");
    const res = await fetch("/api/settings/gcash-qr", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not remove QR");
      return;
    }
    setQrUrl("");
    setMessage("GCash QR removed.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">GCash payment</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Guests pay by GCash only. Add your number and/or QR, plus the steps they
        should follow. You will see their order number, reference, and receipt
        on the calendar.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              GCash number
            </label>
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="09XX XXX XXXX"
              className="w-full max-w-sm rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              Account name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Christine Dela Calzada"
              className="w-full max-w-sm rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              Payment instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={6}
              className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              QR code
            </label>
            {qrUrl && (
              <Image
                src={qrUrl}
                alt="GCash QR"
                width={160}
                height={160}
                className="mb-3 rounded-xl border border-brand-brown/15 bg-white object-contain"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    uploadQr(e.target.files);
                    e.target.value = "";
                  }}
                />
                <span className="btn-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white">
                  {uploading ? "Uploading…" : qrUrl ? "Replace QR" : "Upload QR"}
                </span>
              </label>
              {qrUrl && (
                <Button variant="outline" className="px-4 py-2 text-sm" onClick={removeQr}>
                  Remove QR
                </Button>
              )}
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save GCash details"}
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
