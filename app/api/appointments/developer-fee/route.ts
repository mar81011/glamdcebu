import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const appointmentId = String(body.appointmentId ?? "");
  const paid = Boolean(body.paid);

  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ developer_fee_paid: paid })
    .eq("id", appointmentId)
    .select("id, developer_fee_paid")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, developerFeePaid: data.developer_fee_paid });
}
