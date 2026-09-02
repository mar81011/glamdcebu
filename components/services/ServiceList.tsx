import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatPrice, type Service, type ServiceCategory } from "@/lib/services-data";

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm font-medium text-brand-ink">{service.name}</span>
      <span className="shrink-0 text-sm font-semibold text-brand-brown">
        {formatPrice(service.price)}
      </span>
    </div>
  );
}

export function ServiceList({ category }: { category: ServiceCategory }) {
  return (
    <ContentCard padding="lg">
      <h1 className="font-serif text-2xl text-brand-ink md:text-3xl">
        {category.name}
      </h1>
      <p className="mt-1 text-sm text-brand-muted">{category.description}</p>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-ink">Services</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {category.mainServices.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-brand-brown/10 bg-brand-cream/60 p-4"
            >
              <ServiceRow service={service} />
              <Button
                href={`/book?category=${category.slug}&service=${service.id}`}
                variant="outline"
                className="mt-3 w-full py-2 text-xs"
              >
                Book this
              </Button>
            </div>
          ))}
        </div>
      </section>

      {category.addons.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-brand-ink">Add-ons</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {category.addons.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-brand-brown/10 px-4 py-3"
              >
                <ServiceRow service={service} />
              </div>
            ))}
          </div>
        </section>
      )}
    </ContentCard>
  );
}
