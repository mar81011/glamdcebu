import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CONTACT,
  formatPhoneDisplay,
  mapsUrlFromAddress,
  type ShopContact,
} from "./defaults";

type ContactRow = {
  contact_phone: string | null;
  contact_phone_display: string | null;
  contact_address: string | null;
  contact_maps_url: string | null;
  contact_instagram_url: string | null;
  contact_instagram_label: string | null;
  contact_facebook_url: string | null;
  contact_facebook_label: string | null;
};

export function contactFromRow(row: ContactRow | null | undefined): ShopContact {
  const phone = row?.contact_phone?.trim() || DEFAULT_CONTACT.phone;
  const address = row?.contact_address?.trim() || DEFAULT_CONTACT.address;

  return {
    phone,
    phoneDisplay:
      row?.contact_phone_display?.trim() || formatPhoneDisplay(phone),
    address,
    mapsUrl:
      row?.contact_maps_url?.trim() ||
      mapsUrlFromAddress(address) ||
      DEFAULT_CONTACT.mapsUrl,
    instagramUrl:
      row?.contact_instagram_url?.trim() || DEFAULT_CONTACT.instagramUrl,
    instagramLabel:
      row?.contact_instagram_label?.trim() || DEFAULT_CONTACT.instagramLabel,
    facebookUrl: row?.contact_facebook_url?.trim() || DEFAULT_CONTACT.facebookUrl,
    facebookLabel:
      row?.contact_facebook_label?.trim() || DEFAULT_CONTACT.facebookLabel,
  };
}

export async function getShopContact(): Promise<ShopContact> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_settings")
    .select(
      `contact_phone, contact_phone_display, contact_address, contact_maps_url,
       contact_instagram_url, contact_instagram_label,
       contact_facebook_url, contact_facebook_label`,
    )
    .eq("id", 1)
    .single();

  return contactFromRow(data);
}
