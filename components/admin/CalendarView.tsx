"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { ProductCatalog } from "@/components/admin/ProductCatalog";
import { AccountSettings } from "@/components/admin/AccountSettings";
import { AppointmentReminderSettings } from "@/components/admin/AppointmentReminderSettings";
import { BrandSettings } from "@/components/admin/BrandSettings";
import { ContactSettings } from "@/components/admin/ContactSettings";
import { BookingHistory } from "@/components/admin/BookingHistory";
import { AdminPushSettings } from "@/components/admin/AdminPushSettings";
import { BusinessHoursSettings } from "@/components/admin/BusinessHoursSettings";
import { AppointmentSchedule } from "@/components/admin/AppointmentSchedule";
import { HomeServiceSettings } from "@/components/admin/HomeServiceSettings";
import { WorkPhotosSettings } from "@/components/admin/WorkPhotosSettings";
import { GcashSettings } from "@/components/admin/GcashSettings";
import { visitTypeLabel, type VisitType } from "@/lib/booking/constants";
import { toDateKey } from "@/lib/calendar-utils";

interface Appointment {
  id: string;
  customer_name: string;
  phone: string;
  appointment_at: string;
  duration_minutes: number;
  visit_type: VisitType;
  home_address: string | null;
  total_price: number;
  order_number: string | null;
  payment_reference: string | null;
  payment_proof_url: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  appointment_services: Array<{
    services: { name: string } | { name: string }[] | null;
  }>;
}

export function CalendarView() {
  const [tab, setTab] = useState<"calendar" | "products" | "history" | "settings">(
    "calendar",
  );
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function loadAppointments() {
    setLoading(true);
    const withPayment = await supabase
      .from("appointments")
      .select(
        `id, customer_name, phone, appointment_at, duration_minutes, visit_type, home_address,
         total_price, status, order_number, payment_reference, payment_proof_url,
         appointment_services ( services ( name ) )`,
      )
      .order("appointment_at", { ascending: true });

    if (!withPayment.error) {
      setAppointments((withPayment.data as unknown as Appointment[]) ?? []);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("appointments")
      .select(
        `id, customer_name, phone, appointment_at, duration_minutes, visit_type, home_address,
         total_price, status,
         appointment_services ( services ( name ) )`,
      )
      .order("appointment_at", { ascending: true });
    setAppointments(
      ((data as unknown as Appointment[]) ?? []).map((row) => ({
        ...row,
        order_number: null,
        payment_reference: null,
        payment_proof_url: null,
      })),
    );
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

  async function updateStatus(id: string, status: Appointment["status"]) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadAppointments();
  }

  function selectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
    const [y, m, d] = dateKey.split("-").map(Number);
    setViewDate(new Date(y, m - 1, d));
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
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
          <MonthCalendar
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            selectedDateKey={selectedDateKey}
            onSelectDate={selectDate}
            markedDates={markedDates}
          />

          <AppointmentSchedule
            appointments={appointments}
            loading={loading}
            selectedDateKey={selectedDateKey}
            onSelectDate={selectDate}
            onUpdateStatus={updateStatus}
          />
        </div>
      )}

      {tab === "products" && <ProductCatalog />}

      {tab === "history" && <BookingHistory appointments={appointments} />}

      {tab === "settings" && (
        <div className="space-y-4">
          <WorkPhotosSettings />
          <GcashSettings />
          <AdminPushSettings />
          <AccountSettings />
          <BrandSettings />
          <ContactSettings />
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
