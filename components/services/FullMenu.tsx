import { formatPrice, type Service, type ServiceCategory } from "@/lib/services-data";
import { orderMenuCategories } from "@/lib/services/catalog";
import { ContentCard } from "@/components/ui/ContentCard";

function MenuRow({ service }: { service: Service }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="min-w-0 text-sm text-brand-ink">{service.name}</span>
      <span className="shrink-0 text-sm font-semibold text-brand-brown">
        {formatPrice(service.price)}
      </span>
    </div>
  );
}

function CategoryBlock({ category }: { category: ServiceCategory }) {
  return (
    <section id={category.slug} className="scroll-mt-6">
      <h2 className="text-center font-serif text-xl text-brand-ink md:text-2xl">
        {category.name}
      </h2>
      <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-x-8 gap-y-0.5">
        {category.mainServices.map((service) => (
          <MenuRow key={service.id} service={service} />
        ))}
      </div>
      {category.addons.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-1 text-center text-[11px] font-semibold tracking-wide text-brand-subtle uppercase">
            Add-ons
          </h3>
          <div className="mx-auto grid max-w-md grid-cols-2 gap-x-8">
            {category.addons.map((service) => (
              <MenuRow key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function FullMenu({ categories }: { categories: ServiceCategory[] }) {
  const ordered = orderMenuCategories(categories);

  return (
    <ContentCard padding="md">
      {ordered.map((category, index) => (
        <div
          key={category.slug}
          className={index > 0 ? "mt-6 border-t border-brand-brown/10 pt-6" : ""}
        >
          <CategoryBlock category={category} />
        </div>
      ))}
    </ContentCard>
  );
}
