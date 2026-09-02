import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 24;
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

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_photos")
    .select("id, public_url, alt, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ photos: [] });
  }

  return NextResponse.json({
    photos: (data ?? []).map((row) => ({
      id: row.id,
      url: row.public_url,
      alt: row.alt,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  const { count } = await admin.from("work_photos").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_PHOTOS) {
    return NextResponse.json({ error: `You can upload up to ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP photo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo must be 8MB or smaller." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage.from("work").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = admin.storage.from("work").getPublicUrl(path);
  const alt = String(form.get("alt") ?? "").trim().slice(0, 120);

  const { data, error } = await admin
    .from("work_photos")
    .insert({
      storage_path: path,
      public_url: publicData.publicUrl,
      alt,
      sort_order: count ?? 0,
    })
    .select("id, public_url, alt")
    .single();

  if (error) {
    await admin.storage.from("work").remove([path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    photo: { id: data.id, url: data.public_url, alt: data.alt },
  });
}

export async function DELETE(request: Request) {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server is missing storage credentials." }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  }

  const { data: row } = await admin
    .from("work_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (row?.storage_path) {
    await admin.storage.from("work").remove([row.storage_path]);
  }

  const { error } = await admin.from("work_photos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
