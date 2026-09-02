import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_DURATION_MINUTES } from "@/lib/booking/constants";
import { getAvailableSlots } from "@/lib/booking/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  const supabase = await createClient();

  const [hoursRes, blockedRes, apptsRes] = await Promise.all([
    supabase.from("business_hours").select("*"),
    supabase.from("blocked_slots").select("start_at, end_at"),
    supabase
      .from("appointments")
      .select("appointment_at, duration_minutes, status")
      .gte("appointment_at", `${date}T00:00:00`)
      .lt("appointment_at", `${date}T23:59:59`),
  ]);

  const slots = getAvailableSlots(
    date,
    hoursRes.data ?? [],
    blockedRes.data ?? [],
    (apptsRes.data ?? []).map((a) => ({
      appointment_at: a.appointment_at,
      duration_minutes: a.duration_minutes ?? APPOINTMENT_DURATION_MINUTES,
      status: a.status,
    })),
    APPOINTMENT_DURATION_MINUTES,
  );

  return NextResponse.json({ slots, durationMinutes: APPOINTMENT_DURATION_MINUTES });
}
