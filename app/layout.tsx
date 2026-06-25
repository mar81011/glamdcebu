import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, Great_Vibes, Playfair_Display } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-brand-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLAM'D Cebu — Book Beauty & Nail Appointments",
  description:
    "Book lashes, brows, and nail services online at GLAM'D Cebu. South Ridge Residences, Cebu.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "GLAM'D Cebu",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#6b4c3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-ink">
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`(function(){window.__glamdPwaInstall=window.__glamdPwaInstall||{deferred:null};window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__glamdPwaInstall.deferred=e;window.dispatchEvent(new Event("glamd-pwa-install-ready"));});})();`}
        </Script>
        <ServiceWorkerRegistration />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
