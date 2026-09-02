import { Button } from "@/components/ui/Button";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { TrackAppointmentForm } from "@/components/booking/TrackAppointmentForm";
import { WorkGallery } from "@/components/gallery/WorkGallery";
import { FullMenu } from "@/components/services/FullMenu";
import { PageShell } from "@/components/ui/PageShell";
import { getWorkPhotos } from "@/lib/gallery/get-photos";
import { getServiceCatalog } from "@/lib/services/get-catalog";

export default async function HomePage() {
  const [categories, photos] = await Promise.all([
    getServiceCatalog(),
    getWorkPhotos(),
  ]);

  return (
    <PageShell>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="mb-5 flex flex-col items-center text-center">
          <h1 className="font-serif text-3xl text-brand-ink">Menu</h1>
          <Button href="/book" className="mt-3 w-full max-w-xs">
            Book an appointment
          </Button>
          <div className="mt-4 w-full max-w-md">
            <TrackAppointmentForm />
          </div>
        </div>

        <FullMenu categories={categories} />
        <WorkGallery photos={photos} />
        <ContactFooter />
      </main>
    </PageShell>
  );
}
