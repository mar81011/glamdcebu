import { ContactFooter } from "@/components/ui/ContactFooter";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageShell } from "@/components/ui/PageShell";
import { TrackAppointmentForm } from "@/components/booking/TrackAppointmentForm";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function TrackPage({ searchParams }: Props) {
  const params = await searchParams;

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
          <TrackAppointmentForm
            initialOrder={params.order ?? ""}
            autoLookup={Boolean(params.order)}
          />
        </ContentCard>
        <ContactFooter />
      </main>
    </PageShell>
  );
}
