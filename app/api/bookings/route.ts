import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { APPOINTMENT_DURATION_MINUTES } from "@/lib/booking/constants";
import { generateOrderNumber } from "@/lib/booking/order-number";
import { slotToIso } from "@/lib/booking/slots";
import { ensurePaymentsBucket, PAYMENTS_BUCKET } from "@/lib/payment/storage";
import { notifyAdminsOfBooking } from "@/lib/push/send-booking-notification";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;
const ALLOWED_PROOF = new Set(["image/jpeg", "image/png", "image/webp"]);

type BookingInput = {
  customerName: string;
  phone: string;
  notes: string;
  date: string;
  time: string;
  visitType: string;
  homeAddress: string;
  serviceIds: string[];
  paymentReference: string;
  paymentProof: File | null;
};

async function parseBooking(request: Request): Promise<BookingInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const rawIds = form.getAll("serviceIds").map(String);
    const mainServiceId = String(form.get("mainServiceId") ?? "");
    const proof = form.get("paymentProof");
    return {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      notes: String(form.get("notes") ?? ""),
      date: String(form.get("date") ?? ""),
      time: String(form.get("time") ?? ""),
      visitType: String(form.get("visitType") ?? "walk_in"),
      homeAddress: String(form.get("homeAddress") ?? ""),
      serviceIds: rawIds.length > 0 ? rawIds : mainServiceId ? [mainServiceId] : [],
      paymentReference: String(form.get("paymentReference") ?? ""),
      paymentProof: proof instanceof File && proof.size > 0 ? proof : null,
    };
  }

  const body = await request.json();
  const rawServiceIds = body.serviceIds;
  const serviceIds = Array.from(
    new Set(
      (Array.isArray(rawServiceIds) && rawServiceIds.length > 0
        ? rawServiceIds
        : [body.mainServiceId, ...(body.addonIds ?? [])]
      ).filter((id: unknown) => typeof id === "string" && id.length > 0),
    ),
  );
  return {
    customerName: String(body.customerName ?? ""),
    phone: String(body.phone ?? ""),
    notes: String(body.notes ?? ""),
    date: String(body.date ?? ""),
    time: String(body.time ?? ""),
    visitType: String(body.visitType ?? "walk_in"),
    homeAddress: String(body.homeAddress ?? ""),
    serviceIds,
    paymentReference: String(body.paymentReference ?? ""),
    paymentProof: null,
  };
}

export async function POST(request: Request) {
  try {
    const input = await parseBooking(request);
    const serviceIds = Array.from(new Set(input.serviceIds));

    if (
      !input.customerName.trim() ||
      !input.phone.trim() ||
      !input.date ||
      !input.time ||
      serviceIds.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (input.visitType !== "walk_in" && input.visitType !== "home_service") {
      return NextResponse.json({ error: "Invalid visit type" }, { status: 400 });
    }

    if (input.visitType === "home_service" && !input.homeAddress.trim()) {
      return NextResponse.json({ error: "Home address is required" }, { status: 400 });
    }

    const paymentReference = input.paymentReference.trim();
    if (paymentReference.length < 5) {
      return NextResponse.json(
        { error: "Enter your GCash reference number" },
        { status: 400 },
      );
    }

    if (!input.paymentProof) {
      return NextResponse.json(
        { error: "Upload a screenshot of your GCash receipt" },
        { status: 400 },
      );
    }
    if (!ALLOWED_PROOF.has(input.paymentProof.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WebP receipt photo." }, { status: 400 });
    }
    if (input.paymentProof.size > MAX_PROOF_BYTES) {
      return NextResponse.json({ error: "Receipt photo must be 8MB or smaller." }, { status: 400 });
    }

    const supabase = await createClient();
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
    }

    const { data: settings } = await supabase
      .from("shop_settings")
      .select("home_service_fee")
      .eq("id", 1)
      .single();

    const homeServiceFee =
      input.visitType === "home_service" ? (settings?.home_service_fee ?? 0) : 0;

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
      (input.visitType === "home_service" ? homeServiceFee : 0);

    const appointmentAt = slotToIso(input.date, input.time);
    const ext =
      input.paymentProof.type === "image/png"
        ? "png"
        : input.paymentProof.type === "image/webp"
          ? "webp"
          : "jpg";
    const proofPath = `proofs/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await input.paymentProof.arrayBuffer());

    await ensurePaymentsBucket(admin);

    const { error: uploadError } = await admin.storage.from(PAYMENTS_BUCKET).upload(proofPath, buffer, {
      contentType: input.paymentProof.type,
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = admin.storage.from(PAYMENTS_BUCKET).getPublicUrl(proofPath);

    let appointment:
      | { id: string; order_number: string }
      | null = null;
    let lastError = "";

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const orderNumber = generateOrderNumber();
      const { data, error: apptError } = await supabase
        .from("appointments")
        .insert({
          customer_name: input.customerName.trim(),
          phone: input.phone.trim(),
          notes: input.notes.trim() || null,
          appointment_at: appointmentAt,
          duration_minutes: APPOINTMENT_DURATION_MINUTES,
          visit_type: input.visitType,
          home_address: input.visitType === "home_service" ? input.homeAddress.trim() : null,
          home_service_fee: input.visitType === "home_service" ? homeServiceFee : 0,
          status: "pending",
          total_price: total,
          order_number: orderNumber,
          payment_method: "gcash",
          payment_reference: paymentReference,
          payment_proof_url: publicData.publicUrl,
          payment_proof_path: proofPath,
        })
        .select("id, order_number")
        .single();

      if (data) {
        appointment = data;
        break;
      }
      lastError = apptError?.message ?? "Booking failed";
      if (!lastError.toLowerCase().includes("order_number")) {
        await admin.storage.from(PAYMENTS_BUCKET).remove([proofPath]);
        return NextResponse.json({ error: lastError }, { status: 500 });
      }
    }

    if (!appointment) {
      await admin.storage.from(PAYMENTS_BUCKET).remove([proofPath]);
      return NextResponse.json({ error: lastError || "Booking failed" }, { status: 500 });
    }

    const rows = serviceIds.map((sid) => ({
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
      customerName: input.customerName.trim(),
      date: input.date,
      time: input.time,
      visitType: input.visitType,
    });

    return NextResponse.json({
      id: appointment.id,
      orderNumber: appointment.order_number,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
