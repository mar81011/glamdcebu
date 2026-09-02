"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { normalizeOrderNumber } from "@/lib/booking/order-number";
import type { TrackedAppointment } from "@/lib/booking/tracked-appointment";
import { formatPrice } from "@/lib/services-data";

export function TrackAppointmentForm({
  initialOrder = "",
  autoLookup = false,
  submitLabel = "Track my appointment",
}: {
  initialOrder?: string;
  autoLookup?: boolean;
  submitLabel?: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState<TrackedAppointment | null>(null);

  async function lookup(raw: string) {
    const normalized = normalizeOrderNumber(raw);
    if (!normalized) {
      setAppointment(null);
      setError("Enter a valid order number.");
      setOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/bookings/track?order=${encodeURIComponent(normalized)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setAppointment(null);
        setError(data.error ?? "No appointment found for that order number.");
      } else {
        setAppointment(data as TrackedAppointment);
        setError("");
        setOrder(data.orderNumber ?? normalized);
      }
      setOpen(true);
    } catch {
      setAppointment(null);
      setError("Could not check that order. Try again.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void lookup(order);
  }

  useEffect(() => {
    if (autoLookup && initialOrder) void lookup(initialOrder);
    // One lookup for a shared /track?order= link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLookup, initialOrder]);

  return (
    <>
      <form onSubmit={submit} className="flex flex-col items-stretch gap-2 sm:flex-row">
        <input
          type="text"
          value={order}
          onChange={(e) => setOrder(e.target.value.toUpperCase())}
          placeholder="Order number (GLAM-XXXXXX)"
          aria-label="Order number"
          className="field flex-1"
        />
        <Button type="submit" disabled={loading} className="shrink-0 px-5 py-2.5 text-sm">
          {loading ? "Checking…" : submitLabel}
        </Button>
      </form>

      {open && (
        <TrackResultModal
          appointment={appointment}
          error={error}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function TrackResultModal({
  appointment,
  error,
  onClose,
}: {
  appointment: TrackedAppointment | null;
  error: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-title"
        className="surface-card w-full max-w-md rounded-3xl p-5 shadow-lg sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="label-kicker mb-1 text-center">Guest tracking</p>
        <h2 id="track-title" className="text-center font-serif text-xl text-brand-ink">
          {appointment ? appointment.orderNumber : "Track my appointment"}
        </h2>

        {error && (
          <p className="mt-4 text-center text-sm text-red-700">{error}</p>
        )}

        {appointment && (
          <div className="mt-4 space-y-2.5 text-sm">
            <Row label="Status" value={appointment.statusLabel} highlight />
            <Row label="Name" value={appointment.customerName} />
            <Row label="Services" value={appointment.services || "—"} />
            <Row label="Visit" value={appointment.visit} />
            <Row label="Date" value={appointment.date} />
            <Row label="Time" value={appointment.time} />
            <Row label="Total" value={formatPrice(appointment.total)} />
            {appointment.statusHint && (
              <p className="pt-2 text-center text-sm text-brand-muted">
                {appointment.statusHint}
              </p>
            )}
          </div>
        )}

        <Button onClick={onClose} variant="outline" className="mt-5 w-full">
          Close
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-brand-muted">{label}</span>
      <span
        className={`text-right font-medium ${highlight ? "font-bold text-brand-ink" : "text-brand-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
