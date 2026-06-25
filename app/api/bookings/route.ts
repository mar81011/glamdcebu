import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_DURATION_MINUTES } from "@/lib/booking/constants";
import { slotToIso } from "@/lib/booking/slots";
import { notifyAdminsOfBooking } from "@/lib/push/send-booking-notification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      notes,
      date,
      time,
      mainServiceId,
      addonIds = [],
      visitType = "walk_in",
      homeAddress,
    } = body;

    if (!customerName?.trim() || !phone?.trim() || !date || !time || !mainServiceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (visitType !== "walk_in" && visitType !== "home_service") {
      return NextResponse.json({ error: "Invalid visit type" }, { status: 400 });
    }

    if (visitType === "home_service" && !homeAddress?.trim()) {
      return NextResponse.json({ error: "Home address is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: settings } = await supabase
      .from("shop_settings")
      .select("home_service_fee")
      .eq("id", 1)
      .single();

    const homeServiceFee =
      visitType === "home_service" ? (settings?.home_service_fee ?? 0) : 0;

    const serviceIds = [mainServiceId, ...addonIds];

    const { data: services, error: svcError } = await supabase
      .from("services")
      .select("id, price, is_active")
      .in("id", serviceIds)
      .eq("is_active", true);

    if (svcError || !services?.length || services.length !== serviceIds.length) {
      return NextResponse.json({ error: "Invalid or unavailable services" }, { status: 400 });
    }

    const total =
      services.reduce((sum, s) => sum + s.price, 0) +
      (visitType === "home_service" ? homeServiceFee : 0);

    const appointmentAt = slotToIso(date, time);

    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .insert({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        notes: notes?.trim() || null,
        appointment_at: appointmentAt,
        duration_minutes: APPOINTMENT_DURATION_MINUTES,
        visit_type: visitType,
        home_address: visitType === "home_service" ? homeAddress.trim() : null,
        home_service_fee: visitType === "home_service" ? homeServiceFee : 0,
        status: "pending",
        total_price: total,
      })
      .select("id")
      .single();

    if (apptError || !appointment) {
      return NextResponse.json({ error: apptError?.message ?? "Booking failed" }, { status: 500 });
    }

    const rows = serviceIds.map((sid: string) => ({
      appointment_id: appointment.id,
      service_id: sid,
    }));

    const { error: linkError } = await supabase
      .from("appointment_services")
      .insert(rows);

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    void notifyAdminsOfBooking({
      customerName: customerName.trim(),
      date,
      time,
      visitType,
    });

    return NextResponse.json({ id: appointment.id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
