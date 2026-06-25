import { createClient } from "@/lib/supabase/server";
import { DEFAULT_BRANDING } from "./defaults";

export async function getShopBranding() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_settings")
    .select("site_title")
    .eq("id", 1)
    .single();

  return {
    siteTitle: data?.site_title?.trim() || DEFAULT_BRANDING.siteTitle,
  };
}
