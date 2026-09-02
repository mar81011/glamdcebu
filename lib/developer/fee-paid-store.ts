import type { SupabaseClient } from "@supabase/supabase-js";

const PAID_IDS_PATH = "config/developer-fee-paid.json";

export async function readDeveloperPaidIds(
  admin: SupabaseClient,
): Promise<Set<string>> {
  const { data, error } = await admin.storage
    .from("payments")
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
  const body = JSON.stringify({ paidIds: [...paidIds] });
  const { error } = await admin.storage.from("payments").upload(PAID_IDS_PATH, body, {
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
