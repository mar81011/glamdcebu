"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DAY_LABELS,
  DAY_ORDER,
  toTimeInputValue,
  type BusinessHour,
} from "@/lib/booking/business-hours";

function defaultHours(): BusinessHour[] {
  return DAY_ORDER.map((day) => ({
    day_of_week: day,
    open_time: "09:00:00",
    close_time: "18:00:00",
    is_closed: day === 0,
  }));
}

export function BusinessHoursSettings() {
  const [hours, setHours] = useState<BusinessHour[]>(defaultHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/business-hours")
      .then((res) => res.json())
      .then((data) => {
        if (data.hours?.length) {
          const sorted = DAY_ORDER.map(
            (day) =>
              data.hours.find((h: BusinessHour) => h.day_of_week === day) ?? {
                day_of_week: day,
                open_time: "09:00:00",
                close_time: "18:00:00",
                is_closed: day === 0,
              },
          );
          setHours(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function updateDay(day: number, patch: Partial<BusinessHour>) {
    setHours((prev) =>
      prev.map((row) =>
        row.day_of_week === day ? { ...row, ...patch } : row,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/business-hours", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    if (data.hours?.length) {
      const sorted = DAY_ORDER.map(
        (day) =>
          data.hours.find((h: BusinessHour) => h.day_of_week === day) ??
          hours.find((h) => h.day_of_week === day)!,
      );
      setHours(sorted);
    }
    setMessage("Business hours updated. Booking slots will follow these times.");
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Business Hours</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Set open and close times per day. Clients only see bookable slots within
        these hours.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="mt-4">
          <div className="overflow-x-auto">
            <div className="min-w-[20rem]">
              <div className="grid grid-cols-[5.5rem_1fr_1fr_3.25rem] items-center gap-x-3 border-b border-brand-brown/10 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-subtle">
                  Day
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-subtle">
                  Open
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-subtle">
                  Close
                </span>
                <span className="text-center text-[11px] font-semibold uppercase tracking-wide text-brand-subtle">
                  Off
                </span>
              </div>

              <div className="divide-y divide-brand-brown/8">
                {hours.map((row) => (
                  <div
                    key={row.day_of_week}
                    className="grid grid-cols-[5.5rem_1fr_1fr_3.25rem] items-center gap-x-3 py-2.5"
                  >
                    <span className="text-sm font-semibold text-brand-ink">
                      {DAY_LABELS[row.day_of_week].slice(0, 3)}
                    </span>

                    <input
                      type="time"
                      value={toTimeInputValue(row.open_time)}
                      disabled={row.is_closed}
                      onChange={(e) =>
                        updateDay(row.day_of_week, {
                          open_time: `${e.target.value}:00`,
                        })
                      }
                      className="w-full min-w-0 rounded-lg border border-brand-brown/20 bg-white px-2 py-1.5 text-sm text-brand-ink disabled:cursor-not-allowed disabled:bg-brand-cream/60 disabled:text-brand-subtle"
                    />

                    <input
                      type="time"
                      value={toTimeInputValue(row.close_time)}
                      disabled={row.is_closed}
                      onChange={(e) =>
                        updateDay(row.day_of_week, {
                          close_time: `${e.target.value}:00`,
                        })
                      }
                      className="w-full min-w-0 rounded-lg border border-brand-brown/20 bg-white px-2 py-1.5 text-sm text-brand-ink disabled:cursor-not-allowed disabled:bg-brand-cream/60 disabled:text-brand-subtle"
                    />

                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={row.is_closed}
                        onChange={(e) =>
                          updateDay(row.day_of_week, {
                            is_closed: e.target.checked,
                          })
                        }
                        aria-label={`${DAY_LABELS[row.day_of_week]} closed`}
                        className="h-4 w-4 accent-brand-brown"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="mt-4 px-6 py-2 text-sm">
            {saving ? "Saving…" : "Save hours"}
          </Button>
          {message && (
            <p className="mt-2 text-sm font-medium text-green-800">{message}</p>
          )}
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
