import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GLAM'D Cebu",
    statusBarStyle: "default",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
