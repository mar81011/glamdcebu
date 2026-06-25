"use client";

import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/services-data";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatTimeRange,
  visitTypeLabel,
  type VisitType,
} from "@/lib/booking/constants";
import { parseDateKey, toDateKey } from "@/lib/calendar-utils";
import { getJoinedServiceName } from "@/lib/supabase/service-join";

export interface ScheduleAppointment {
  id: string;
  customer_name: string;
  phone: string;
  appointment_at: string;
  duration_minutes: number;
  visit_type: VisitType;
  home_address: string | null;
  total_price: number;
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

interface AppointmentScheduleProps {
  appointments: ScheduleAppointment[];
  loading: boolean;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onUpdateStatus: (id: string, status: ScheduleAppointment["status"]) => void;
}

export function AppointmentSchedule({
  appointments,
  loading,
  selectedDateKey,
  onSelectDate,
  onUpdateStatus,
}: AppointmentScheduleProps) {
  const selectedDate = parseDateKey(selectedDateKey);

  const dayAppointments = appointments
    .filter((a) => toDateKey(new Date(a.appointment_at)) === selectedDateKey)
    .sort(
      (a, b) =>
        new Date(a.appointment_at).getTime() -
        new Date(b.appointment_at).getTime(),
    );

  function shiftDay(delta: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onSelectDate(toDateKey(next));
  }

  function goToday() {
    onSelectDate(toDateKey(new Date()));
  }

  const isToday = selectedDateKey === toDateKey(new Date());

  const title = selectedDate.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftDay(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-ink"
          aria-label="Previous day"
        >
          ←
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-serif text-sm font-semibold text-brand-ink sm:text-base">
            {title}
          </p>
          {!isToday && (
            <button
              type="button"
              onClick={goToday}
              className="mt-0.5 text-xs font-medium text-brand-brown hover:underline"
            >
              Jump to today
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => shiftDay(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-ink"
          aria-label="Next day"
        >
          →
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-brand-muted">Loading…</p>
      ) : dayAppointments.length === 0 ? (
        <p className="rounded-xl border border-brand-brown/12 bg-brand-cream/50 px-4 py-8 text-center text-sm text-brand-muted">
          No appointments on this day
        </p>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map((appt) => {
            const dt = new Date(appt.appointment_at);
            const duration = appt.duration_minutes ?? APPOINTMENT_DURATION_MINUTES;
            const timeRange = formatTimeRange(dt, duration);
            const serviceNames = appt.appointment_services
              .map((s) => getJoinedServiceName(s.services))
              .filter(Boolean)
              .join(", ");
            const timeLabel = dt.toLocaleTimeString("en-PH", {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={appt.id}
                className="rounded-2xl border border-brand-brown/12 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl font-semibold text-brand-brown">
                      {timeLabel}
                    </p>
                    <p className="text-xs text-brand-muted">{timeRange}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                    <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-semibold text-brand-brown">
                      {visitTypeLabel(appt.visit_type)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-brand-brown/8 pt-3">
                  <p className="font-semibold text-brand-ink">{appt.customer_name}</p>
                  <p className="text-sm text-brand-muted">{appt.phone}</p>
                  <p className="mt-2 text-sm font-medium text-brand-ink">{serviceNames}</p>
                  <p className="mt-1 text-xs text-brand-muted">{formatPrice(appt.total_price)}</p>
                  {appt.visit_type === "home_service" && appt.home_address && (
                    <p className="mt-1 text-xs text-brand-muted">
                      {appt.home_address}
                    </p>
                  )}
                </div>

                {appt.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 py-1.5 text-xs"
                      onClick={() => onUpdateStatus(appt.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 py-1.5 text-xs"
                      onClick={() => onUpdateStatus(appt.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
