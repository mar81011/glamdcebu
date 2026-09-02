import { notFound } from "next/navigation";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { ContentCard } from "@/components/ui/ContentCard";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { PageShell } from "@/components/ui/PageShell";
import { PillBadge } from "@/components/ui/PillBadge";
import { CopyOrderNumber } from "@/components/booking/CopyOrderNumber";
import { TrackAppointmentForm } from "@/components/booking/TrackAppointmentForm";
import { Button } from "@/components/ui/Button";
import { getShopContact } from "@/lib/contact/get-contact";
import { formatPrice } from "@/lib/services-data";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatDurationLabel,
  formatTimeRange,
  visitTypeLabel,
} from "@/lib/booking/constants";
import { guestStatusLabel } from "@/lib/booking/order-number";
import { createClient } from "@/lib/supabase/server";
import { getJoinedServiceName } from "@/lib/supabase/service-join";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConfirmPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const withOrder = await supabase
    .from("appointments")
    .select(
      `id, customer_name, phone, appointment_at, total_price, status, order_number,
       duration_minutes, visit_type, home_address, home_service_fee, payment_reference,
       appointment_services ( service_id, services ( name, price ) )`,
    )
    .eq("id", id)
    .maybeSingle();

  const { data: appointment } =
    withOrder.data
      ? withOrder
      : await supabase
          .from("appointments")
          .select(
            `id, customer_name, phone, appointment_at, total_price, status,
             duration_minutes, visit_type, home_address, home_service_fee,
             appointment_services ( service_id, services ( name, price ) )`,
          )
          .eq("id", id)
          .single();

  if (!appointment) notFound();

  const contact = await getShopContact();

  const services = (appointment.appointment_services ?? []) as Array<{
    services: { name: string } | { name: string }[] | null;
  }>;

  const serviceNames =
    services.map((s) => getJoinedServiceName(s.services)).filter(Boolean).join(", ") ||
    "Service";

  const start = new Date(appointment.appointment_at);
  const duration =
    appointment.duration_minutes ?? APPOINTMENT_DURATION_MINUTES;
  const date = start.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeRange = formatTimeRange(start, duration);

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <ContentCard padding="lg" className="w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>
          <PillBadge>{guestStatusLabel(appointment.status)}</PillBadge>

          <h1 className="mt-6 font-serif text-2xl text-brand-ink">
            Booking Request Sent
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">
            Thank you, {appointment.customer_name}! Christine will confirm your
            appointment shortly.
          </p>

          {"order_number" in appointment && appointment.order_number && (
            <div className="mt-5">
              <CopyOrderNumber orderNumber={String(appointment.order_number)} />
            </div>
          )}

          <DiamondDivider />

          <div className="space-y-2.5 text-left text-sm">
            <Row label="Services" value={serviceNames} />
            <Row label="Visit" value={visitTypeLabel(appointment.visit_type)} />
            {appointment.visit_type === "home_service" && appointment.home_address && (
              <Row label="Address" value={appointment.home_address} />
            )}
            {(appointment.home_service_fee ?? 0) > 0 && (
              <Row
                label="Home service fee"
                value={formatPrice(appointment.home_service_fee)}
              />
            )}
            <Row label="Date" value={date} />
            <Row
              label="Time"
              value={`${timeRange} (${formatDurationLabel(duration)})`}
            />
            <Row label="Total" value={formatPrice(appointment.total_price)} highlight />
            {"payment_reference" in appointment && appointment.payment_reference && (
              <Row label="GCash ref" value={String(appointment.payment_reference)} />
            )}
            <Row label="Status" value={guestStatusLabel(appointment.status)} />
          </div>

          {"order_number" in appointment && appointment.order_number && (
            <div className="mt-8">
              <TrackAppointmentForm
                initialOrder={String(appointment.order_number)}
                submitLabel="Check status"
              />
            </div>
          )}

          <div className="mt-8">
            <Button href="/" variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>

          <p className="mt-6 text-xs text-brand-subtle">
            Questions? Call{" "}
            <a
              href={`tel:${contact.phone}`}
              className="font-semibold text-brand-brown underline-offset-2 hover:underline"
            >
              {contact.phoneDisplay}
            </a>
          </p>
        </ContentCard>
      </div>
      <ContactFooter />
    </PageShell>
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
        className={`text-right font-medium capitalize ${highlight ? "text-base font-bold text-brand-ink" : "text-brand-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
