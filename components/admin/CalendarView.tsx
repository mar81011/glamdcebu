"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { Button } from "@/components/ui/Button";
import { ProductCatalog } from "@/components/admin/ProductCatalog";
import { AppointmentReminderSettings } from "@/components/admin/AppointmentReminderSettings";
import { BrandSettings } from "@/components/admin/BrandSettings";
import { ContactSettings } from "@/components/admin/ContactSettings";
import { BookingHistory } from "@/components/admin/BookingHistory";
import { AdminPushSettings } from "@/components/admin/AdminPushSettings";
import { BusinessHoursSettings } from "@/components/admin/BusinessHoursSettings";
import { HomeServiceSettings } from "@/components/admin/HomeServiceSettings";
import { formatPrice } from "@/lib/services-data";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatTimeRange,
  visitTypeLabel,
  type VisitType,
} from "@/lib/booking/constants";
import { parseDateKey, toDateKey } from "@/lib/calendar-utils";
import { getJoinedServiceName } from "@/lib/supabase/service-join";

interface Appointment {
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

export function CalendarView() {
  const [tab, setTab] = useState<"calendar" | "products" | "history" | "settings">("calendar");
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function loadAppointments() {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select(
        `id, customer_name, phone, appointment_at, duration_minutes, visit_type, home_address,
         total_price, status,
         appointment_services ( services ( name ) )`,
      )
      .order("appointment_at", { ascending: true });
    setAppointments((data as unknown as Appointment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const markedDates = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of appointments) {
      if (a.status === "cancelled") continue;
      const key = toDateKey(new Date(a.appointment_at));
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [appointments]);

  const visible = selectedDateKey
    ? appointments.filter(
        (a) => toDateKey(new Date(a.appointment_at)) === selectedDateKey,
      )
    : appointments;

  async function updateStatus(id: string, status: Appointment["status"]) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadAppointments();
  }

  const listTitle = selectedDateKey
    ? parseDateKey(selectedDateKey).toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "All appointments";

  function renderAppointment(appt: Appointment) {
    const serviceNames = appt.appointment_services
      .map((s) => getJoinedServiceName(s.services))
      .filter(Boolean)
      .join(", ");
    const dt = new Date(appt.appointment_at);
    const duration = appt.duration_minutes ?? APPOINTMENT_DURATION_MINUTES;
    const timeRange = formatTimeRange(dt, duration);

    return (
      <div
        key={appt.id}
        className="rounded-2xl border border-brand-brown/12 bg-white p-4 shadow-sm"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-ink">{appt.customer_name}</p>
            <p className="text-xs text-brand-muted">{appt.phone}</p>
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
        <p className="text-sm font-medium text-brand-ink">{serviceNames}</p>
        <p className="mt-1 text-xs text-brand-muted">
          {dt.toLocaleDateString("en-PH")} · {timeRange} ·{" "}
          {formatPrice(appt.total_price)}
        </p>
        {appt.visit_type === "home_service" && appt.home_address && (
          <p className="mt-1 text-xs text-brand-muted">
            Address: {appt.home_address}
          </p>
        )}
        {appt.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 py-1.5 text-xs"
              onClick={() => updateStatus(appt.id, "confirmed")}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-1.5 text-xs"
              onClick={() => updateStatus(appt.id, "cancelled")}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-full border border-brand-brown/10 bg-brand-cream p-1">
        <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")}>
          Calendar
        </TabButton>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          History
        </TabButton>
        <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
          Settings
        </TabButton>
      </div>

      {tab === "calendar" && (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <MonthCalendar
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            selectedDateKey={selectedDateKey}
            onSelectDate={(key) =>
              setSelectedDateKey((prev) => (prev === key ? undefined : key))
            }
            markedDates={markedDates}
          />

          <div className="mt-4 space-y-3 lg:mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xs font-semibold tracking-[0.2em] text-brand-muted uppercase">
                {listTitle}
              </h3>
              {selectedDateKey && (
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(undefined)}
                  className="text-xs font-medium text-brand-brown hover:underline"
                >
                  Show all
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-brand-muted">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="rounded-xl border border-brand-brown/12 bg-brand-cream/50 px-4 py-6 text-center text-sm text-brand-muted">
                No appointments
              </p>
            ) : (
              <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                {visible.map((appt) => renderAppointment(appt))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "products" && <ProductCatalog />}

      {tab === "history" && (
        <BookingHistory appointments={appointments} />
      )}

      {tab === "settings" && (
        <div className="space-y-4">
          <BrandSettings />
          <ContactSettings />
          <AdminPushSettings />
          <AppointmentReminderSettings />
          <BusinessHoursSettings />
          <HomeServiceSettings />
        </div>
      )}
    </div>
  );
}

function TabButton({
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
      className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
        active
          ? "btn-gradient shadow-sm"
          : "text-brand-muted hover:text-brand-ink"
      }`}
    >
      {children}
    </button>
  );
}
