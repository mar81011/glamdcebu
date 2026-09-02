import type { SupabaseClient } from "@supabase/supabase-js";

export const DEVELOPER_CONFIG_BUCKET = "developer-config";
const PAID_IDS_PATH = "developer-fee-paid.json";

export async function ensureDeveloperConfigBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (
    buckets?.some(
      (bucket) =>
        bucket.id === DEVELOPER_CONFIG_BUCKET || bucket.name === DEVELOPER_CONFIG_BUCKET,
    )
  ) {
    return;
  }

  await admin.storage.createBucket(DEVELOPER_CONFIG_BUCKET, {
    public: false,
    fileSizeLimit: 1024 * 1024,
    allowedMimeTypes: ["application/json"],
  });
}

export async function readDeveloperPaidIds(
  admin: SupabaseClient,
): Promise<Set<string>> {
  await ensureDeveloperConfigBucket(admin);

  const { data, error } = await admin.storage
    .from(DEVELOPER_CONFIG_BUCKET)
    .download(PAID_IDS_PATH);

  if (error || !data) return new Set();

  try {
    const parsed = JSON.parse(await data.text()) as { paidIds?: string[] };
    return new Set((parsed.paidIds ?? []).filter(Boolean));
  } catch {
    return new Set();
  }
}

export async function writeDeveloperPaidIds(
  admin: SupabaseClient,
  paidIds: Set<string>,
): Promise<void> {
  await ensureDeveloperConfigBucket(admin);

  const body = JSON.stringify({ paidIds: [...paidIds] });
  const { error } = await admin.storage
    .from(DEVELOPER_CONFIG_BUCKET)
    .upload(PAID_IDS_PATH, body, {
      contentType: "application/json",
      upsert: true,
    });
  if (error) throw error;
}

export async function setDeveloperFeePaid(
  admin: SupabaseClient,
  appointmentId: string,
  paid: boolean,
): Promise<Set<string>> {
  const paidIds = await readDeveloperPaidIds(admin);
  if (paid) paidIds.add(appointmentId);
  else paidIds.delete(appointmentId);
  await writeDeveloperPaidIds(admin, paidIds);
  return paidIds;
}
