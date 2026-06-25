import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  groupServiceRows,
  type DbServiceRow,
} from "@/lib/services/catalog";
import type { ServiceCategory } from "@/lib/services-data";

export const getServiceCatalog = cache(
  async (options?: { includeInactive?: boolean }): Promise<ServiceCategory[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("services")
      .select(
        `id, name, price, type, is_active, sort_order, category_id,
         service_categories ( slug, name, brand, description, sort_order )`,
      )
      .order("sort_order", { ascending: true });

    if (!options?.includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data } = await query;
    return groupServiceRows((data as unknown as DbServiceRow[]) ?? []);
  },
);

export async function getCategoryBySlug(
  slug: string,
): Promise<ServiceCategory | undefined> {
  const catalog = await getServiceCatalog();
  return catalog.find((c) => c.slug === slug);
}
