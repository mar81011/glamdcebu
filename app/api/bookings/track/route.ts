import { NextResponse } from "next/server";
import { getTrackedAppointment } from "@/lib/booking/track";

export async function GET(request: Request) {
  const order = new URL(request.url).searchParams.get("order") ?? "";
  const { appointment, error } = await getTrackedAppointment(order);

  if (!appointment) {
    const status = error.includes("valid") ? 400 : 404;
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(appointment);
}
