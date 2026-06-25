export type ServiceType = "main" | "addon";

export interface Service {
  id: string;
  name: string;
  price: number;
  type: ServiceType;
}

export interface ServiceCategory {
  slug: string;
  name: string;
  brand: string;
  description: string;
  mainServices: Service[];
  addons: Service[];
}

export const CONTACT = {
  phone: "09665518594",
  phoneDisplay: "0966 551 8594",
  instagram: "https://instagram.com/glam.d21",
  instagramAlt: "https://instagram.com/christinedela.calzada",
  facebook: "https://facebook.com",
  facebookName: "Glam'd / Christine Dela Calzada",
  address: "South Ridge Residences Blk2 Lot 2",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=South+Ridge+Residences+Cebu",
};

export { DEFAULT_CONTACT } from "@/lib/contact/defaults";

export const CATEGORIES: ServiceCategory[] = [
  {
    slug: "lashes-brows",
    name: "Lashes & Brows",
    brand: "GLAM'D",
    description: "Classic to mega volume lashes, lifts, and brow lamination.",
    mainServices: [
      { id: "lb-classic", name: "Classic", price: 499, type: "main" },
      { id: "lb-hybrid", name: "Hybrid", price: 699, type: "main" },
      { id: "lb-volume", name: "Volume", price: 899, type: "main" },
      { id: "lb-mega", name: "Mega Volume", price: 999, type: "main" },
      { id: "lb-wetset", name: "Wetset", price: 999, type: "main" },
      { id: "lb-lift", name: "Eyelash lift", price: 399, type: "main" },
      {
        id: "lb-lift-tint",
        name: "Eyelash lift with tint",
        price: 449,
        type: "main",
      },
      { id: "lb-brow", name: "Brow lamination", price: 399, type: "main" },
      {
        id: "lb-brow-tint",
        name: "Brow lamination with tint",
        price: 449,
        type: "main",
      },
    ],
    addons: [
      {
        id: "lb-addon-styles",
        name: "Cateye, dolleye, squirrel",
        price: 99,
        type: "addon",
      },
      { id: "lb-wispy", name: "Wispy", price: 299, type: "addon" },
      { id: "lb-removal", name: "Removal", price: 199, type: "addon" },
    ],
  },
  {
    slug: "nails",
    name: "Nails",
    brand: "GLAM'D D",
    description: "Gel nails, extensions, and custom nail art add-ons.",
    mainServices: [
      { id: "n-gel", name: "Nail gel plain", price: 299, type: "main" },
      {
        id: "n-extension",
        name: "Nail Extension plain",
        price: 499,
        type: "main",
      },
    ],
    addons: [
      { id: "n-french", name: "French tips", price: 15, type: "addon" },
      { id: "n-cateye", name: "Cateye", price: 15, type: "addon" },
      { id: "n-ombre", name: "Ombre", price: 15, type: "addon" },
      { id: "n-chrome", name: "Chrome", price: 20, type: "addon" },
      { id: "n-dual", name: "Dual base", price: 10, type: "addon" },
      { id: "n-3d-art", name: "3D Nail Art", price: 30, type: "addon" },
      { id: "n-handpaint", name: "Hand-paint art", price: 35, type: "addon" },
      {
        id: "n-rhinestone",
        name: "Rhinestone/pearl",
        price: 15,
        type: "addon",
      },
      { id: "n-sticker", name: "Sticker", price: 15, type: "addon" },
      { id: "n-jewels", name: "3D jewels", price: 15, type: "addon" },
    ],
  },
];

export function getCategory(slug: string): ServiceCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH")}`;
}

export const MOCK_APPOINTMENTS = [
  {
    id: "1",
    customerName: "Maria Santos",
    phone: "09171234567",
    service: "Hybrid Lashes",
    date: "2026-06-26",
    time: "10:00 AM",
    status: "confirmed" as const,
    total: 699,
  },
  {
    id: "2",
    customerName: "Jen Cruz",
    phone: "09281234567",
    service: "Nail Extension + Chrome",
    date: "2026-06-26",
    time: "2:00 PM",
    status: "pending" as const,
    total: 519,
  },
  {
    id: "3",
    customerName: "Ana Reyes",
    phone: "09351234567",
    service: "Brow lamination with tint",
    date: "2026-06-27",
    time: "11:30 AM",
    status: "pending" as const,
    total: 449,
  },
  {
    id: "4",
    customerName: "Lisa Tan",
    phone: "09191234567",
    service: "Classic Lashes",
    date: "2026-06-28",
    time: "9:30 AM",
    status: "confirmed" as const,
    total: 499,
  },
  {
    id: "5",
    customerName: "Bea Lim",
    phone: "09201234567",
    service: "Nail gel plain",
    date: "2026-06-30",
    time: "3:00 PM",
    status: "pending" as const,
    total: 299,
  },
];

export function getAppointmentCountsByDate(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const appt of MOCK_APPOINTMENTS) {
    counts[appt.date] = (counts[appt.date] ?? 0) + 1;
  }
  return counts;
}

export const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];
