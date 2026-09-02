import type { Service, ServiceCategory, ServiceType } from "@/lib/services-data";

export interface DbServiceRow {
  id: string;
  name: string;
  price: number;
  type: ServiceType;
  is_active: boolean;
  sort_order: number | null;
  category_id: string;
  service_categories: {
    slug: string;
    name: string;
    brand: string;
    description: string | null;
    sort_order: number | null;
  } | null;
}

const CATEGORY_PREFIX: Record<string, string> = {
  "lashes-brows": "lb",
  nails: "n",
};

export function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function makeServiceId(categorySlug: string, name: string): string {
  const prefix = CATEGORY_PREFIX[categorySlug] ?? categorySlug.slice(0, 2);
  const base = slugifyName(name) || "item";
  return `${prefix}-${base}`;
}

export function groupServiceRows(rows: DbServiceRow[]): ServiceCategory[] {
  const map = new Map<string, ServiceCategory>();

  for (const row of rows) {
    const cat = row.service_categories;
    if (!cat) continue;

    if (!map.has(cat.slug)) {
      map.set(cat.slug, {
        slug: cat.slug,
        name: cat.name,
        brand: cat.brand,
        description: cat.description ?? "",
        mainServices: [],
        addons: [],
      });
    }

    const service: Service = {
      id: row.id,
      name: row.name,
      price: row.price,
      type: row.type,
    };

    const bucket = map.get(cat.slug)!;
    if (row.type === "main") bucket.mainServices.push(service);
    else bucket.addons.push(service);
  }

  return orderMenuCategories(
    [...map.values()].sort((a, b) => {
      const aOrder =
        rows.find((r) => r.service_categories?.slug === a.slug)?.service_categories
          ?.sort_order ?? 0;
      const bOrder =
        rows.find((r) => r.service_categories?.slug === b.slug)?.service_categories
          ?.sort_order ?? 0;
      return aOrder - bOrder;
    }),
  );
}

export function orderMenuCategories(categories: ServiceCategory[]): ServiceCategory[] {
  return [
    ...categories.filter((c) => c.slug === "lashes-brows"),
    ...categories.filter((c) => c.slug === "nails"),
    ...categories.filter((c) => c.slug !== "lashes-brows" && c.slug !== "nails"),
  ];
}
