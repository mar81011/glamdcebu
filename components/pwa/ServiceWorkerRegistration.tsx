"use client";

import { useEffect } from "react";

/** Registers the service worker so the app meets PWA install criteria. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Non-fatal: install UI still shows manual steps on iOS.
      });
  }, []);

  return null;
}
