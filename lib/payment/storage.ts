import type { SupabaseClient } from "@supabase/supabase-js";

export const PAYMENTS_BUCKET = "payments";

export async function ensurePaymentsBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.id === PAYMENTS_BUCKET || bucket.name === PAYMENTS_BUCKET)) {
    return;
  }

  await admin.storage.createBucket(PAYMENTS_BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
}
