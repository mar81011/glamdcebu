import { BackLink } from "@/components/ui/BackLink";
import { CalendarView } from "@/components/admin/CalendarView";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageShell } from "@/components/ui/PageShell";

export default function AdminPage() {
  return (
    <PageShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackLink href="/" label="Home" />
        <AdminLogoutButton />
      </div>

      <ContentCard>
        <p className="label-kicker mb-2">Studio</p>
        <h1 className="mb-1 font-serif text-2xl italic text-brand-ink">Admin Calendar</h1>
        <p className="mb-6 text-sm text-brand-muted">
          Manage appointments and availability
        </p>
        <CalendarView />
      </ContentCard>
    </PageShell>
  );
}
