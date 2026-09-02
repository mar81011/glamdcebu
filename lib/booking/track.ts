import { createClient } from "@/lib/supabase/server";
import {
  guestStatusHint,
  guestStatusLabel,
  normalizeOrderNumber,
} from "@/lib/booking/order-number";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatDurationLabel,
  formatTimeRange,
  visitTypeLabel,
} from "@/lib/booking/constants";
import { getJoinedServiceName } from "@/lib/supabase/service-join";

export type TrackedAppointment = {
  orderNumber: string;
  status: string;
  statusLabel: string;
  statusHint: string;
  customerName: string;
  services: string;
  date: string;
  time: string;
  visit: string;
  total: number;
};

export async function getTrackedAppointment(
  rawOrder: string,
): Promise<{ appointment: TrackedAppointment | null; error: string }> {
  const order = normalizeOrderNumber(rawOrder);
  if (!/^GLAM-[A-Z0-9]{6}$/.test(order)) {
    return { appointment: null, error: "Enter a valid order number." };
  }

  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `id, order_number, customer_name, appointment_at, total_price, status,
       duration_minutes, visit_type,
       appointment_services ( services ( name ) )`,
    )
    .eq("order_number", order)
    .maybeSingle();

  if (!appointment) {
    return { appointment: null, error: "No appointment found for that order number." };
  }

  const services = (appointment.appointment_services ?? []) as Array<{
    services: { name: string } | { name: string }[] | null;
  }>;
  const serviceNames = services
    .map((s) => getJoinedServiceName(s.services))
    .filter(Boolean)
    .join(", ");

  const start = new Date(appointment.appointment_at);
  const duration = appointment.duration_minutes ?? APPOINTMENT_DURATION_MINUTES;

  return {
    error: "",
    appointment: {
      orderNumber: appointment.order_number,
      status: appointment.status,
      statusLabel: guestStatusLabel(appointment.status),
      statusHint: guestStatusHint(appointment.status),
      customerName: appointment.customer_name,
      services: serviceNames,
      date: start.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: `${formatTimeRange(start, duration)} (${formatDurationLabel(duration)})`,
      visit: visitTypeLabel(appointment.visit_type),
      total: appointment.total_price,
    },
  };
}
