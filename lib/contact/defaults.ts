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

export function normalizeInstagramUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!url.hostname.includes("instagram.com")) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  const handle = trimmed.replace(/^@/, "").replace(/\/$/, "");
  if (!handle || !/^[a-zA-Z0-9._]+$/.test(handle)) return null;
  return `https://instagram.com/${handle}`;
}

export function normalizeFacebookUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!url.hostname.includes("facebook.com") && !url.hostname.includes("fb.com")) {
        return null;
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  const path = trimmed.replace(/^@/, "").replace(/^\//, "").replace(/\/$/, "");
  if (!path) return null;
  return `https://facebook.com/${path}`;
}

export function instagramLabelFromInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("@")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const handle = url.pathname.replace(/\//g, "").trim();
      return handle ? `@${handle}` : trimmed;
    } catch {
      return trimmed;
    }
  }
  return `@${trimmed.replace(/^@/, "")}`;
}
