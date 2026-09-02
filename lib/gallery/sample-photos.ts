import type { WorkPhoto } from "@/lib/gallery/types";

/** Shown on the homepage carousel until real uploads are added in admin. */
export const SAMPLE_WORK_PHOTOS: WorkPhoto[] = [
  {
    id: "sample-lashes",
    url: "/samples/work-lashes.jpg",
    alt: "Lash extensions",
  },
  {
    id: "sample-nails",
    url: "/samples/work-nails.webp",
    alt: "Nail art",
  },
  {
    id: "sample-brows",
    url: "/samples/work-brows.webp",
    alt: "Brow lamination",
  },
];
