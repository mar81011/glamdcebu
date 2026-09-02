import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePaymentsBucket, PAYMENTS_BUCKET } from "@/lib/payment/storage";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase };
}

export async function POST(request: Request) {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  await ensurePaymentsBucket(admin);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a QR image to upload." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  }

  const { data: current } = await admin
    .from("shop_settings")
    .select("gcash_qr_path")
    .eq("id", 1)
    .single();

  if (current?.gcash_qr_path) {
    await admin.storage.from(PAYMENTS_BUCKET).remove([current.gcash_qr_path]);
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `qr/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage.from(PAYMENTS_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = admin.storage.from(PAYMENTS_BUCKET).getPublicUrl(path);
  const { error } = await admin
    .from("shop_settings")
    .update({
      gcash_qr_path: path,
      gcash_qr_url: publicData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    await admin.storage.from(PAYMENTS_BUCKET).remove([path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ qrUrl: publicData.publicUrl });
}

export async function DELETE() {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  const { data: current } = await admin
    .from("shop_settings")
    .select("gcash_qr_path")
    .eq("id", 1)
    .single();

  if (current?.gcash_qr_path) {
    await admin.storage.from(PAYMENTS_BUCKET).remove([current.gcash_qr_path]);
  }

  const { error } = await admin
    .from("shop_settings")
    .update({
      gcash_qr_path: null,
      gcash_qr_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
