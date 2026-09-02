"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/services-data";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatTimeRange,
  visitTypeLabel,
  type VisitType,
} from "@/lib/booking/constants";
import {
  buildDailyBuckets,
  getMonthRange,
  getWeekRange,
  isInRange,
  shiftAnchor,
} from "@/lib/booking/history";
import { getJoinedServiceName } from "@/lib/supabase/service-join";

export interface HistoryAppointment {
  id: string;
  customer_name: string;
  phone: string;
  appointment_at: string;
  duration_minutes: number;
  visit_type: VisitType;
  total_price: number;
  order_number?: string | null;
  payment_reference?: string | null;
  payment_proof_url?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  appointment_services: Array<{
    services: { name: string } | { name: string }[] | null;
  }>;
}

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  confirmed: "bg-green-100 text-green-900 border-green-300",
  cancelled: "bg-red-100 text-red-900 border-red-300",
  completed: "bg-stone-100 text-stone-700 border-stone-300",
};

export function BookingHistory({
  appointments,
}: {
  appointments: HistoryAppointment[];
}) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const range = useMemo(
    () => (period === "week" ? getWeekRange(anchorDate) : getMonthRange(anchorDate)),
    [period, anchorDate],
  );

  const inPeriod = useMemo(
    () =>
      appointments
        .filter((a) => isInRange(a.appointment_at, range))
        .sort(
          (a, b) =>
            new Date(b.appointment_at).getTime() -
            new Date(a.appointment_at).getTime(),
        ),
    [appointments, range],
  );

  const stats = useMemo(() => {
    const active = inPeriod.filter((a) => a.status !== "cancelled");
    return {
      total: inPeriod.length,
      active: active.length,
      cancelled: inPeriod.filter((a) => a.status === "cancelled").length,
      revenue: active.reduce((sum, a) => sum + a.total_price, 0),
      pending: active.filter((a) => a.status === "pending").length,
      confirmed: active.filter((a) => a.status === "confirmed").length,
      completed: active.filter((a) => a.status === "completed").length,
    };
  }, [inPeriod]);

  const dailyBuckets = useMemo(
    () => buildDailyBuckets(range, inPeriod),
    [range, inPeriod],
  );

  const maxDayCount = Math.max(1, ...dailyBuckets.map((b) => b.count));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <PeriodToggle
          active={period === "week"}
          onClick={() => setPeriod("week")}
        >
          Weekly
        </PeriodToggle>
        <PeriodToggle
          active={period === "month"}
          onClick={() => setPeriod("month")}
        >
          Monthly
        </PeriodToggle>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-brown/12 bg-brand-cream/50 px-3 py-2">
        <button
          type="button"
          onClick={() => setAnchorDate(shiftAnchor(anchorDate, period, -1))}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-brand-brown hover:bg-white"
          aria-label={`Previous ${period}`}
        >
          ←
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold text-brand-ink">{range.label}</p>
          <button
            type="button"
            onClick={() => setAnchorDate(new Date())}
            className="text-[11px] font-medium text-brand-brown hover:underline"
          >
            Today
          </button>
        </div>
        <button
          type="button"
          onClick={() => setAnchorDate(shiftAnchor(anchorDate, period, 1))}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-brand-brown hover:bg-white"
          aria-label={`Next ${period}`}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Bookings" value={String(stats.active)} />
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} />
        <StatCard label="Confirmed" value={String(stats.confirmed)} />
        <StatCard label="Cancelled" value={String(stats.cancelled)} />
      </div>

      <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-subtle">
          Bookings per day
        </h3>
        <div
          className={`mt-3 grid gap-1 ${period === "week" ? "grid-cols-7" : "grid-cols-7 sm:grid-cols-7"}`}
        >
          {dailyBuckets.map((day) => (
            <div key={day.dateKey} className="flex min-w-0 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end justify-center sm:h-20">
                <div
                  className="w-full max-w-[2rem] rounded-t-md bg-brand-brown/80 transition-all"
                  style={{
                    height: `${Math.max(4, (day.count / maxDayCount) * 100)}%`,
                    opacity: day.count > 0 ? 1 : 0.15,
                  }}
                  title={`${day.count} booking(s)`}
                />
              </div>
              <span className="w-full truncate text-center text-[9px] font-medium text-brand-muted sm:text-[10px]">
                {period === "week"
                  ? day.label.split(" ")[0]
                  : day.label.replace(/^[A-Za-z]+ /, "")}
              </span>
              {day.count > 0 && (
                <span className="text-[10px] font-bold text-brand-brown">{day.count}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-serif text-xs font-semibold tracking-[0.2em] text-brand-muted uppercase">
          History ({inPeriod.length})
        </h3>
        {inPeriod.length === 0 ? (
          <p className="rounded-xl border border-brand-brown/12 bg-brand-cream/50 px-4 py-6 text-center text-sm text-brand-muted">
            No bookings in this {period === "week" ? "week" : "month"}.
          </p>
        ) : (
          <div className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
            {inPeriod.map((appt) => {
              const dt = new Date(appt.appointment_at);
              const serviceNames = appt.appointment_services
                .map((s) => getJoinedServiceName(s.services))
                .filter(Boolean)
                .join(", ");
              const duration = appt.duration_minutes ?? APPOINTMENT_DURATION_MINUTES;

              return (
                <div
                  key={appt.id}
                  className="rounded-xl border border-brand-brown/10 bg-white px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {appt.customer_name}
                      </p>
                      <p className="truncate text-xs text-brand-muted">{serviceNames}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-muted">
                    {dt.toLocaleDateString("en-PH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {formatTimeRange(dt, duration)} · {formatPrice(appt.total_price)}
                  </p>
                  <p className="text-[10px] text-brand-subtle">
                    {visitTypeLabel(appt.visit_type)} · {appt.phone}
                    {appt.order_number ? ` · ${appt.order_number}` : ""}
                    {appt.payment_reference ? ` · GCash ${appt.payment_reference}` : ""}
                  </p>
                  {appt.payment_proof_url && (
                    <a
                      href={appt.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[10px] font-semibold text-brand-brown underline-offset-2 hover:underline"
                    >
                      View receipt
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "btn-gradient text-white shadow-sm"
          : "border border-brand-brown/15 bg-white text-brand-muted hover:text-brand-ink"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-brown/10 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-subtle">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-brand-ink">{value}</p>
    </div>
  );
}
