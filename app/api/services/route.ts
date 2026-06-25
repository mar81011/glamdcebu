import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  groupServiceRows,
  makeServiceId,
  type DbServiceRow,
} from "@/lib/services/catalog";

export async function GET(request: Request) {
  const supabase = await createClient();
  const admin = new URL(request.url).searchParams.get("admin") === "1";

  let query = supabase
    .from("services")
    .select(
      `id, name, price, type, is_active, sort_order, category_id,
       service_categories ( slug, name, brand, description, sort_order )`,
    )
    .order("sort_order", { ascending: true });

  if (!admin) {
    query = query.eq("is_active", true);
  } else {
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
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data as unknown as DbServiceRow[]) ?? [];
  const categories = groupServiceRows(rows);

  return NextResponse.json({ categories, services: rows });
}

export async function POST(request: Request) {
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
  const { categorySlug, name, price, type } = body;

  if (!categorySlug || !name?.trim() || type !== "main" && type !== "addon") {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  const amount = Number(price);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const { data: category } = await supabase
    .from("service_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  let id = makeServiceId(categorySlug, name.trim());
  const { data: existing } = await supabase.from("services").select("id").eq("id", id).maybeSingle();
  if (existing) {
    id = `${id}-${Date.now().toString(36)}`;
  }

  const { data: maxSort } = await supabase
    .from("services")
    .select("sort_order")
    .eq("category_id", category.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      id,
      category_id: category.id,
      name: name.trim(),
      price: Math.round(amount),
      type,
      is_active: true,
      sort_order: (maxSort?.sort_order ?? 0) + 1,
    })
    .select(
      `id, name, price, type, is_active, sort_order, category_id,
       service_categories ( slug, name, brand, description, sort_order )`,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service });
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
  const { id, isActive, name, price } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof isActive === "boolean") updates.is_active = isActive;
  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    updates.name = trimmed;
  }
  if (price !== undefined) {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    updates.price = Math.round(amount);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: service, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select(
      `id, name, price, type, is_active, sort_order, category_id,
       service_categories ( slug, name, brand, description, sort_order )`,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service });
}

export async function DELETE(request: Request) {
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
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

    const { count } = await supabase
      .from("appointment_services")
      .select("*", { count: "exact", head: true })
      .eq("service_id", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "This product has past bookings. Turn it unavailable instead of deleting.",
      },
      { status: 409 },
    );
  }

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
