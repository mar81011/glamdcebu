import { BackLink } from "@/components/ui/BackLink";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageShell } from "@/components/ui/PageShell";
import { ScheduleOverview } from "@/components/calendar/ScheduleOverview";

export default function CalendarPage() {
  return (
    <PageShell>
      <BackLink />
      <ContentCard>
        <h1 className="font-serif text-2xl text-brand-ink">Schedule Overview</h1>
        <p className="mt-1 mb-6 text-sm text-brand-muted">
          See which days have bookings and find open slots.
        </p>
        <ScheduleOverview />
      </ContentCard>
      <ContactFooter />
    </PageShell>
  );
}
