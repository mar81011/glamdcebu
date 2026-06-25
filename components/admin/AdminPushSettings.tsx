"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  isBraveBrowser,
  pushSubscribeErrorMessage,
  subscribeToPush,
} from "@/lib/push/client";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function AdminPushSettings() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [braveBrowser, setBraveBrowser] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSupported(
      "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );

    void isBraveBrowser().then(setBraveBrowser);

    async function checkSubscription() {
      try {
        const registration = await navigator.serviceWorker.getRegistration("/sw.js");
        const subscription = await registration?.pushManager.getSubscription();
        setEnabled(!!subscription);
      } catch {
        setEnabled(false);
      }
    }

    checkSubscription();
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!window.isSecureContext) {
        setError(
          "Notifications need HTTPS or localhost. Open the site at glamdcebu.vercel.app instead of a local IP address.",
        );
        return;
      }

      if (isIOS() && !isStandalone()) {
        setError(
          "On iPhone, install the app first (Share → Add to Home Screen), then open it and enable notifications here.",
        );
        return;
      }

      if (await isBraveBrowser()) {
        setError(
          'Brave blocks push by default. Open brave://settings/privacy, turn on "Use Google services for push messaging", restart Brave, then try again. Or use Chrome/Edge on desktop.',
        );
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setError(
          "Push is not configured on the server yet. Add VAPID keys to Vercel environment variables.",
        );
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission was denied.");
        return;
      }

      const subscription = await subscribeToPush(publicKey);

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setError("You must be logged in as admin to enable notifications.");
          return;
        }
        if (res.status === 403) {
          setError("Only owner accounts can receive booking notifications.");
          return;
        }
        setError(data.error ?? "Could not save subscription");
        return;
      }

      setEnabled(true);
      setMessage("You'll get a notification when someone books.");
    } catch (err) {
      setError(pushSubscribeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setEnabled(false);
      setMessage("Booking notifications turned off.");
    } catch {
      setError("Could not disable notifications.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
        <h3 className="font-serif text-brand-ink">Booking notifications</h3>
        <p className="mt-1 text-sm text-brand-muted">
          Push alerts are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Booking notifications</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Desktop push works in Chrome and Edge. You&apos;ll get an alert on this
        device when a client books online. Android Chrome and installed iPhone
        apps are supported too.
      </p>
      {braveBrowser && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Brave blocks push unless you enable{" "}
          <strong>Use Google services for push messaging</strong> in{" "}
          <code className="text-[11px]">brave://settings/privacy</code>, then
          restart the browser.
        </p>
      )}

      <div className="mt-4">
        {enabled ? (
          <Button
            variant="outline"
            onClick={disableNotifications}
            disabled={loading}
            className="px-6 py-2 text-sm"
          >
            {loading ? "Updating…" : "Turn off notifications"}
          </Button>
        ) : (
          <Button
            onClick={enableNotifications}
            disabled={loading}
            className="px-6 py-2 text-sm"
          >
            {loading ? "Enabling…" : "Enable notifications"}
          </Button>
        )}
        {message && (
          <p className="mt-2 text-sm font-medium text-green-800">{message}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
