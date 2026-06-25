"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/services-data";

export function HomeServiceSettings() {
  const [fee, setFee] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setFee(String(data.homeServiceFee ?? 0)))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeServiceFee: Number(fee) }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    setFee(String(data.homeServiceFee));
    setMessage("Home service fee updated.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Home Service Fee</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Extra charge added when clients book home service.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              Fee (₱)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full max-w-xs rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-brand-ink focus:border-brand-brown focus:outline-none"
            />
            <p className="mt-1 text-xs text-brand-subtle">
              Current preview: {formatPrice(Number(fee) || 0)}
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save fee"}
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
