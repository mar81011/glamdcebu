import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_BRANDING } from "@/lib/branding/defaults";
import {
  formatPhoneDisplay,
  mapsUrlFromAddress,
  normalizePhoneDigits,
  type ShopContact,
} from "@/lib/contact/defaults";
import { contactFromRow } from "@/lib/contact/get-contact";

const REMINDER_OPTIONS = [0, 1, 2, 4, 24, 48];

const CONTACT_SELECT = `home_service_fee, site_title, appointment_reminder_hours,
  contact_phone, contact_phone_display, contact_address, contact_maps_url,
  contact_instagram_url, contact_instagram_label,
  contact_facebook_url, contact_facebook_label`;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseContactInput(body: Record<string, unknown>): ShopContact | null {
  const raw = body.contact;
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Record<string, unknown>;
  const phone = normalizePhoneDigits(String(input.phone ?? ""));
  if (!phone || phone.length < 7 || phone.length > 15) {
    return null;
  }

  const address = String(input.address ?? "").trim();
  if (!address || address.length > 200) return null;

  const phoneDisplay =
    String(input.phoneDisplay ?? "").trim() || formatPhoneDisplay(phone);
  if (phoneDisplay.length > 40) return null;

  const mapsUrl =
    String(input.mapsUrl ?? "").trim() || mapsUrlFromAddress(address);
  if (!isHttpUrl(mapsUrl)) return null;

  const instagramUrl = String(input.instagramUrl ?? "").trim();
  const facebookUrl = String(input.facebookUrl ?? "").trim();
  if (!isHttpUrl(instagramUrl) || !isHttpUrl(facebookUrl)) return null;

  const instagramLabel = String(input.instagramLabel ?? "").trim();
  const facebookLabel = String(input.facebookLabel ?? "").trim();
  if (!instagramLabel || !facebookLabel) return null;
  if (instagramLabel.length > 80 || facebookLabel.length > 80) return null;

  return {
    phone,
    phoneDisplay,
    address,
    mapsUrl,
    instagramUrl,
    instagramLabel,
    facebookUrl,
    facebookLabel,
  };
}

function settingsResponse(data: {
  home_service_fee: number | null;
  site_title: string | null;
  appointment_reminder_hours: number | null;
  contact_phone: string | null;
  contact_phone_display: string | null;
  contact_address: string | null;
  contact_maps_url: string | null;
  contact_instagram_url: string | null;
  contact_instagram_label: string | null;
  contact_facebook_url: string | null;
  contact_facebook_label: string | null;
}) {
  return {
    homeServiceFee: data.home_service_fee ?? 0,
    siteTitle: data.site_title?.trim() || DEFAULT_BRANDING.siteTitle,
    appointmentReminderHours: data.appointment_reminder_hours ?? 24,
    contact: contactFromRow(data),
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select(CONTACT_SELECT)
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({
      homeServiceFee: 0,
      siteTitle: DEFAULT_BRANDING.siteTitle,
      appointmentReminderHours: 24,
      contact: contactFromRow(null),
    });
  }

  return NextResponse.json(settingsResponse(data));
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
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.homeServiceFee !== undefined) {
    const fee = Number(body.homeServiceFee);
    if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
      return NextResponse.json({ error: "Invalid fee" }, { status: 400 });
    }
    updates.home_service_fee = Math.round(fee);
  }

  if (body.siteTitle !== undefined) {
    const title = String(body.siteTitle).trim();
    if (!title || title.length > 60) {
      return NextResponse.json({ error: "Invalid site title" }, { status: 400 });
    }
    updates.site_title = title;
  }

  if (body.appointmentReminderHours !== undefined) {
    const hours = Number(body.appointmentReminderHours);
    if (!REMINDER_OPTIONS.includes(hours)) {
      return NextResponse.json({ error: "Invalid reminder timing" }, { status: 400 });
    }
    updates.appointment_reminder_hours = hours;
  }

  if (body.contact !== undefined) {
    const contact = parseContactInput(body);
    if (!contact) {
      return NextResponse.json({ error: "Invalid contact details" }, { status: 400 });
    }
    updates.contact_phone = contact.phone;
    updates.contact_phone_display = contact.phoneDisplay;
    updates.contact_address = contact.address;
    updates.contact_maps_url = contact.mapsUrl;
    updates.contact_instagram_url = contact.instagramUrl;
    updates.contact_instagram_label = contact.instagramLabel;
    updates.contact_facebook_url = contact.facebookUrl;
    updates.contact_facebook_label = contact.facebookLabel;
  }

  const { data, error } = await supabase
    .from("shop_settings")
    .update(updates)
    .eq("id", 1)
    .select(CONTACT_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(settingsResponse(data));
}
