import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BrandTitle } from "@/components/ui/BrandTitle";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { ContentCard } from "@/components/ui/ContentCard";
import { PageShell } from "@/components/ui/PageShell";
import { getShopBranding } from "@/lib/branding/get-branding";
import { getServiceCatalog } from "@/lib/services/get-catalog";

export default async function HomePage() {
  const branding = await getShopBranding();
  const categories = await getServiceCatalog();

  return (
    <PageShell backgroundImage="/assets/lashes-brows-menu.png">
      <main className="flex flex-1 flex-col gap-8 lg:gap-10">
        <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          <ContentCard padding="lg" className="flex flex-col lg:col-span-5">
            <div className="flex flex-col items-center py-4 text-center lg:items-start lg:py-6 lg:text-left">
              <BrandTitle title={branding.siteTitle} size="lg" className="lg:items-start" />

              <h1 className="mt-8 font-serif text-4xl leading-tight text-brand-ink md:text-5xl lg:mt-6">
                Beauty &amp; Nails
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-muted md:text-base lg:max-w-sm">
                Lashes, brows, and nail services. Book your appointment online —
                walk-in or home service.
              </p>

              <div className="mt-8 hidden w-full max-w-sm flex-col gap-3 sm:flex lg:mt-10">
                <Button href="/book" className="w-full">
                  Book Now
                </Button>
                <Button href="/calendar" variant="outline" className="w-full">
                  View Schedule
                </Button>
              </div>

              <Link
                href="/admin/login"
                className="mt-6 hidden text-xs font-medium text-brand-subtle underline-offset-2 hover:text-brand-ink hover:underline lg:inline-block"
              >
                Admin login
              </Link>
            </div>
          </ContentCard>

          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="grid gap-5 md:grid-cols-2 md:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/services/${cat.slug}`}
                  className="block rounded-2xl border border-brand-brown/12 bg-white p-5 text-left shadow-[0_8px_30px_rgba(44,31,23,0.06)] transition hover:border-brand-brown/25 hover:shadow-md"
                >
                  <p className="font-serif text-xl font-semibold text-brand-ink md:text-2xl">
                    {cat.name}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-subtle md:text-sm">
                    {cat.description}
                  </p>
                  <span className="mt-3 inline-block text-xs font-bold text-brand-brown">
                    View price list →
                  </span>
                </Link>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
              <Button href="/book" className="w-full">
                Book Now
              </Button>
              <Button href="/calendar" variant="outline" className="w-full">
                View Schedule
              </Button>
            </div>

            <Link
              href="/admin/login"
              className="text-center text-xs font-medium text-brand-subtle underline-offset-2 hover:text-brand-ink hover:underline lg:hidden"
            >
              Admin login
            </Link>
          </div>
        </div>

        <ContactFooter />
      </main>
    </PageShell>
  );
}
