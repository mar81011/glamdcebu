import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkPhoto } from "@/lib/gallery/types";

export const WORK_BUCKET = "work";
export const MAX_WORK_PHOTOS = 24;

export function isMissingWorkPhotosTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (message.includes("work_photos") &&
      (message.includes("schema cache") || message.includes("does not exist")))
  );
}

export async function ensureWorkBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.id === WORK_BUCKET || bucket.name === WORK_BUCKET)) {
    return;
  }

  await admin.storage.createBucket(WORK_BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
}

export function publicWorkUrl(admin: SupabaseClient, path: string) {
  return admin.storage.from(WORK_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function listWorkPhotosFromStorage(admin: SupabaseClient): Promise<WorkPhoto[]> {
  await ensureWorkBucket(admin);
  const { data, error } = await admin.storage.from(WORK_BUCKET).list("", {
    sortBy: { column: "created_at", order: "asc" },
  });
  if (error || !data) return [];

  return data
    .filter((file) => {
      const name = file.name ?? "";
      if (!name || name.startsWith(".")) return false;
      return /\.(jpe?g|png|webp)$/i.test(name);
    })
    .map((file) => ({
      id: file.name,
      url: publicWorkUrl(admin, file.name),
      alt: "Work photo",
    }));
}
