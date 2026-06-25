"use client";

import { useEffect, useState } from "react";
import {
  getDeferredInstallPrompt,
  PWA_INSTALL_READY_EVENT,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-bridge";
import { DEFAULT_SITE_TITLE } from "@/lib/branding/defaults";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [siteTitle, setSiteTitle] = useState(DEFAULT_SITE_TITLE);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteTitle) setSiteTitle(data.siteTitle);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    // Legacy: old builds stored a permanent dismiss flag.
    localStorage.removeItem("glamdcebu-pwa-install-dismissed");

    if (isIOS()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const existing = getDeferredInstallPrompt();
    if (existing) {
      setDeferredPrompt(existing);
      setVisible(true);
    }

    const onReady = () => {
      const prompt = getDeferredInstallPrompt();
      if (!prompt) return;
      setDeferredPrompt(prompt);
      setVisible(true);
    };

    window.addEventListener(PWA_INSTALL_READY_EVENT, onReady);
    return () => window.removeEventListener(PWA_INSTALL_READY_EVENT, onReady);
  }, []);

  function dismiss() {
    // Hide for this page visit only — shows again on refresh.
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
    if (window.__glamdPwaInstall) {
      window.__glamdPwaInstall.deferred = null;
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Install app"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bottom-6"
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2.5 rounded-xl border border-white/40 bg-white/55 py-2 pl-2.5 pr-3 shadow-[0_4px_20px_rgba(44,31,23,0.1)] backdrop-blur-xl md:max-w-2xl lg:max-w-3xl">
        <div className="brand-gradient-bg flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <span className="font-brand-script text-xl leading-none text-white">
            {siteTitle.charAt(0).toLowerCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs font-semibold text-brand-ink">
            Install {siteTitle}
          </p>
          <p className="text-[10px] text-brand-muted">
            {iosHint
              ? "Share → Add to Home Screen"
              : "Quick access from your home screen"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!iosHint && (
            <button
              type="button"
              onClick={install}
              className="btn-gradient rounded-full px-3 py-1 text-[11px] font-semibold text-white"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] font-medium text-brand-subtle hover:text-brand-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
