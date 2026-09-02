import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { WorkPhoto } from "@/lib/gallery/types";

export type { WorkPhoto } from "@/lib/gallery/types";

export const getWorkPhotos = cache(async (): Promise<WorkPhoto[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_photos")
    .select("id, public_url, alt")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    url: row.public_url as string,
    alt: (row.alt as string) || "Work photo",
  }));
});
