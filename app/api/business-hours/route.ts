import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fromTimeInputValue, DAY_LABELS, type BusinessHour } from "@/lib/booking/business-hours";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed")
    .order("day_of_week");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hours: data ?? [] });
}

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

  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const hours = body.hours as BusinessHour[] | undefined;

  if (!Array.isArray(hours) || hours.length !== 7) {
    return NextResponse.json({ error: "Invalid hours data" }, { status: 400 });
  }

  for (const row of hours) {
    if (row.day_of_week < 0 || row.day_of_week > 6) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    if (!row.is_closed) {
      const open = fromTimeInputValue(row.open_time.slice(0, 5));
      const close = fromTimeInputValue(row.close_time.slice(0, 5));
      if (open >= close) {
        return NextResponse.json(
          { error: `${DAY_LABELS[row.day_of_week]}: close must be after open` },
          { status: 400 },
        );
      }
    }
  }

  for (const row of hours) {
    const { error } = await supabase
      .from("business_hours")
      .update({
        open_time: fromTimeInputValue(row.open_time.slice(0, 5)),
        close_time: fromTimeInputValue(row.close_time.slice(0, 5)),
        is_closed: row.is_closed,
      })
      .eq("day_of_week", row.day_of_week);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { data } = await supabase
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed")
    .order("day_of_week");

  return NextResponse.json({ hours: data ?? [] });
}
