import { Button } from "@/components/ui/Button";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { ContentCard } from "@/components/ui/ContentCard";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { PageShell } from "@/components/ui/PageShell";
import { TrackAppointmentForm } from "@/components/booking/TrackAppointmentForm";
import { formatPrice } from "@/lib/services-data";
import { getTrackedAppointment } from "@/lib/booking/track";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function TrackPage({ searchParams }: Props) {
  const params = await searchParams;
  const lookup = params.order
    ? await getTrackedAppointment(params.order)
    : { appointment: null, error: "" };

  return (
    <PageShell>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col py-8">
        <ContentCard>
          <p className="label-kicker mb-2 text-center">Guest tracking</p>
          <h1 className="text-center font-serif text-2xl text-brand-ink">
            Track my appointment
          </h1>
          <p className="mt-2 mb-4 text-center text-sm text-brand-muted">
            Enter the order number from your booking confirmation.
          </p>
          <TrackAppointmentForm />

          {lookup.error && (
            <p className="mt-4 text-center text-sm text-red-700">{lookup.error}</p>
          )}

          {lookup.appointment && (
            <>
              <DiamondDivider />
              <div className="space-y-2.5 text-sm">
                <Row label="Order" value={lookup.appointment.orderNumber} />
                <Row label="Status" value={lookup.appointment.statusLabel} highlight />
                <Row label="Name" value={lookup.appointment.customerName} />
                <Row label="Services" value={lookup.appointment.services || "—"} />
                <Row label="Visit" value={lookup.appointment.visit} />
                <Row label="Date" value={lookup.appointment.date} />
                <Row label="Time" value={lookup.appointment.time} />
                <Row label="Total" value={formatPrice(lookup.appointment.total)} />
              </div>
              {lookup.appointment.statusHint && (
                <p className="mt-4 text-center text-sm text-brand-muted">
                  {lookup.appointment.statusHint}
                </p>
              )}
            </>
          )}

          <div className="mt-6">
            <Button href="/" variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </ContentCard>
        <ContactFooter />
      </main>
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
        className={`text-right font-medium ${highlight ? "font-bold text-brand-ink" : "text-brand-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
