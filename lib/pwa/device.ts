export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Instagram, Facebook, Messenger, etc. — cannot install from these. */
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|TikTok|MicroMessenger|LinkedInApp|GSA\//i.test(
    ua,
  );
}

/** Real Safari on iOS (not Chrome, Firefox, or in-app webviews). */
export function isIOSSafari() {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  if (isInAppBrowser()) return false;
  return (
    /Safari/i.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua)
  );
}
