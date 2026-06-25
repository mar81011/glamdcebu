"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const OPTIONS = [
  { value: 0, label: "Off — no upcoming reminders" },
  { value: 1, label: "1 hour before" },
  { value: 2, label: "2 hours before" },
  { value: 4, label: "4 hours before" },
  { value: 24, label: "24 hours before (day before)" },
  { value: 48, label: "48 hours before (2 days)" },
];

export function AppointmentReminderSettings() {
  const [hours, setHours] = useState("24");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setHours(String(data.appointmentReminderHours ?? 24)))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentReminderHours: Number(hours) }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    setHours(String(data.appointmentReminderHours));
    setMessage("Reminder timing updated.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Appointment reminders</h3>
      <p className="mt-1 text-sm text-brand-muted">
        How far ahead to remind you about upcoming bookings on devices with
        notifications enabled. New bookings still alert instantly.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink">
              Remind me
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full max-w-sm rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
            >
              {OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={save} disabled={saving} className="px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save reminders"}
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
