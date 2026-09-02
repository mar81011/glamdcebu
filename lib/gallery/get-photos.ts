import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isMissingWorkPhotosTable,
  listWorkPhotosFromStorage,
} from "@/lib/gallery/work-storage";
import { SAMPLE_WORK_PHOTOS } from "@/lib/gallery/sample-photos";
import type { WorkPhoto } from "@/lib/gallery/types";

export type { WorkPhoto } from "@/lib/gallery/types";

export const getWorkPhotos = cache(async (): Promise<WorkPhoto[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_photos")
    .select("id, public_url, alt")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!error && data) {
    const photos = data.map((row) => ({
      id: row.id as string,
      url: row.public_url as string,
      alt: (row.alt as string) || "Work photo",
    }));
    if (photos.length > 0) return photos;
    return SAMPLE_WORK_PHOTOS;
  }

  if (!isMissingWorkPhotosTable(error)) return SAMPLE_WORK_PHOTOS;

  const admin = createAdminClient();
  if (!admin) return SAMPLE_WORK_PHOTOS;
  const storagePhotos = await listWorkPhotosFromStorage(admin);
  return storagePhotos.length > 0 ? storagePhotos : SAMPLE_WORK_PHOTOS;
});
