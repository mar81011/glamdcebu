import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  readDeveloperPaidIds,
  setDeveloperFeePaid,
  ensureDeveloperConfigBucket,
} from "@/lib/developer/fee-paid-store";

async function requireDeveloper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "developer") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await requireDeveloper();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  await ensureDeveloperConfigBucket(admin);
  const paidIds = await readDeveloperPaidIds(admin);
  return NextResponse.json({ paidIds: [...paidIds] });
}

export async function PATCH(request: Request) {
  const auth = await requireDeveloper();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  const body = await request.json();
  const appointmentId = String(body.appointmentId ?? "");
  const paid = Boolean(body.paid);

  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
  }

  await ensureDeveloperConfigBucket(admin);
  try {
    const paidIds = await setDeveloperFeePaid(admin, appointmentId, paid);

    // Keep DB column in sync when the migration has been applied.
    const { error: dbError } = await admin
      .from("appointments")
      .update({ developer_fee_paid: paid })
      .eq("id", appointmentId);

    if (dbError && !dbError.message.includes("developer_fee_paid")) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: appointmentId,
      developerFeePaid: paidIds.has(appointmentId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save paid status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
