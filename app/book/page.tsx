import { Suspense } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { BookingForm } from "@/components/booking/BookingForm";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { PageShell } from "@/components/ui/PageShell";

export default function BookPage() {
  return (
    <PageShell>
      <BackLink />
      <Suspense
        fallback={
          <div className="rounded-3xl border border-brand-brown/10 bg-white p-6 text-center text-brand-muted shadow-md">
            Loading...
          </div>
        }
      >
        <BookingForm />
      </Suspense>
      <ContactFooter />
    </PageShell>
  );
}
