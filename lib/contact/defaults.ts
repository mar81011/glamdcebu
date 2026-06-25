export interface ShopContact {
  phone: string;
  phoneDisplay: string;
  address: string;
  mapsUrl: string;
  instagramUrl: string;
  instagramLabel: string;
  facebookUrl: string;
  facebookLabel: string;
}

export const DEFAULT_CONTACT: ShopContact = {
  phone: "09665518594",
  phoneDisplay: "0966 551 8594",
  address: "South Ridge Residences Blk2 Lot 2",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=South+Ridge+Residences+Cebu",
  instagramUrl: "https://instagram.com/glam.d21",
  instagramLabel: "@glam.d21",
  facebookUrl: "https://facebook.com",
  facebookLabel: "Christine Dela Calzada",
};

export function mapsUrlFromAddress(address: string): string {
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length === 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone.trim();
}
