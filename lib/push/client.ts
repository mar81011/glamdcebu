/** Decode a URL-safe base64 VAPID public key for PushManager.subscribe(). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const trimmed = base64String.trim();
  const padding = "=".repeat((4 - (trimmed.length % 4)) % 4);
  const base64 = (trimmed + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

export async function isBraveBrowser(): Promise<boolean> {
  const brave = (navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } })
    .brave;
  if (!brave?.isBrave) return false;
  try {
    return await brave.isBrave();
  } catch {
    return false;
  }
}

export async function clearPushSubscription(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
}

export async function subscribeToPush(publicKey: string): Promise<PushSubscription> {
  await clearPushSubscription();

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  await navigator.serviceWorker.ready;

  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  if (applicationServerKey.length !== 65) {
    throw new Error(
      `Invalid VAPID public key length (${applicationServerKey.length}). Regenerate keys with: npx web-push generate-vapid-keys`,
    );
  }

  const subscribeOptions: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as BufferSource,
  };

  try {
    return await registration.pushManager.subscribe(subscribeOptions);
  } catch (error) {
    const message =
      error instanceof DOMException
        ? error.message
        : error instanceof Error
          ? error.message
          : "";

    if (!/push service error/i.test(message)) {
      throw error;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
    const freshRegistration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    await navigator.serviceWorker.ready;
    return freshRegistration.pushManager.subscribe(subscribeOptions);
  }
}

export function pushSubscribeErrorMessage(error: unknown): string {
  const message =
    error instanceof DOMException
      ? error.message
      : error instanceof Error
        ? error.message
        : "";

  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Notification permission was blocked. Allow notifications in your browser or Windows settings.";
  }

  if (/push service error/i.test(message)) {
    return [
      "Your browser could not reach the push service (Chrome uses Google on desktop).",
      "Try: Chrome or Edge (not Brave), disable ad blockers for this site, or in Brave enable Settings → Privacy → “Use Google services for push messaging”, then restart the browser.",
    ].join(" ");
  }

  if (message) return message;
  return "Could not enable notifications on this device.";
}
