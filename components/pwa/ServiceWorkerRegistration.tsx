"use client";

import { useEffect } from "react";

/** Updates the service worker so an old fetch interceptor cannot block page loads. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Non-fatal.
      });
  }, []);

  return null;
}
