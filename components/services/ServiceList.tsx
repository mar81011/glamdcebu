import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { PillBadge } from "@/components/ui/PillBadge";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatPrice, type Service, type ServiceCategory } from "@/lib/services-data";

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm font-medium text-brand-ink">{service.name}</span>
      <span className="shrink-0 text-sm font-bold text-brand-brown">
        {formatPrice(service.price)}
      </span>
    </div>
  );
}

interface ServiceListProps {
  category: ServiceCategory;
}

export function ServiceList({ category }: ServiceListProps) {
  return (
    <ContentCard padding="lg" className="rounded-t-3xl">
      <div className="mb-6 text-center">
        <PillBadge>Price List</PillBadge>
      </div>

      <h2 className="mb-1 text-center font-serif text-3xl text-brand-ink">
        {category.brand}
      </h2>

      <DiamondDivider />

      <section>
        <h3 className="mb-3 text-center font-serif text-xs font-semibold tracking-[0.2em] text-brand-muted uppercase md:mb-4">
          Main Services
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {category.mainServices.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-brand-brown/12 bg-brand-cream/40 p-4"
            >
              <ServiceRow service={service} />
              <div className="pt-3">
                <Button
                  href={`/book?category=${category.slug}&service=${service.id}`}
                  variant="outline"
                  className="w-full py-2 text-xs"
                >
                  Book this service
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {category.addons.length > 0 && (
        <>
          <DiamondDivider />
          <section>
            <h3 className="mb-3 text-center font-serif text-xs font-semibold tracking-[0.2em] text-brand-muted uppercase">
              Add Ons
            </h3>
            <div className="divide-y divide-brand-brown/12 md:grid md:grid-cols-2 md:gap-3 md:divide-y-0">
              {category.addons.map((service) => (
                <div
                  key={service.id}
                  className="md:rounded-xl md:border md:border-brand-brown/12 md:bg-brand-cream/30 md:px-4 md:py-2"
                >
                  <ServiceRow service={service} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </ContentCard>
  );
}
