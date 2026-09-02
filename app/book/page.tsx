import { Suspense } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { BookingForm } from "@/components/booking/BookingForm";
import { PageShell } from "@/components/ui/PageShell";
import { getServiceCatalog } from "@/lib/services/get-catalog";

export default async function BookPage() {
  const categories = await getServiceCatalog();

  return (
    <PageShell>
      <BackLink />
      <Suspense
        fallback={
          <div className="surface-card rounded-[1.75rem] p-6 text-center text-brand-muted">
            Loading...
          </div>
        }
      >
        <BookingForm initialCategories={categories} />
      </Suspense>
    </PageShell>
  );
}
