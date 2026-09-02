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
        <CalendarView />
      </ContentCard>
    </PageShell>
  );
}
