"use client";

import { useEffect, useState } from "react";
import {
  getDeferredInstallPrompt,
  PWA_INSTALL_READY_EVENT,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-bridge";
import {
  isInAppBrowser,
  isIOS,
  isIOSSafari,
  isStandalone,
} from "@/lib/pwa/device";
import { DEFAULT_SITE_TITLE } from "@/lib/branding/defaults";

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function IOSInstallGuide({
  siteTitle,
  inAppBrowser,
  onClose,
}: {
  siteTitle: string;
  inAppBrowser: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-ink/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-brand-brown/15 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ios-install-title" className="font-serif text-lg text-brand-ink">
          Add {siteTitle} to Home Screen
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          iPhone does not install from our banner — use Safari&apos;s own buttons
          below.
        </p>

        {inAppBrowser ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              You&apos;re viewing this inside another app (e.g. Instagram or
              Facebook). Install only works in <strong>Safari</strong>.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-brand-ink">
              <li>
                Tap the <strong>⋯</strong> or <strong>browser</strong> menu at the
                top or bottom
              </li>
              <li>
                Choose <strong>Open in Safari</strong> (or copy the link below and
                paste in Safari)
              </li>
              <li>Then follow the Safari steps</li>
            </ol>
            <button
              type="button"
              onClick={copyLink}
              className="w-full rounded-xl border border-brand-brown/20 py-2.5 text-sm font-semibold text-brand-brown"
            >
              {copied ? "Link copied!" : "Copy site link"}
            </button>
          </div>
        ) : (
          <ol className="mt-4 space-y-4 text-sm text-brand-ink">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-brown/10 text-xs font-bold text-brand-brown">
                1
              </span>
              <span>
                Make sure you&apos;re in <strong>Safari</strong> (not Chrome on
                iPhone).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-brown/10 text-xs font-bold text-brand-brown">
                2
              </span>
              <span className="flex-1">
                At the <strong>bottom of Safari</strong>, tap the{" "}
                <strong>Share</strong> button — square with an arrow pointing up
                <span className="mt-1 inline-flex align-middle">
                  <ShareIcon className="ml-1 inline h-5 w-5 text-brand-brown" />
                </span>
                . It is <em>not</em> on this popup.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-brown/10 text-xs font-bold text-brand-brown">
                3
              </span>
              <span>
                Scroll the menu and tap{" "}
                <strong>Add to Home Screen</strong> (+ icon).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-brown/10 text-xs font-bold text-brand-brown">
                4
              </span>
              <span>
                Tap <strong>Add</strong> in the top-right corner.
              </span>
            </li>
          </ol>
        )}

        {!inAppBrowser && (
          <p className="mt-4 flex items-center justify-center gap-1 text-xs text-brand-muted">
            <ShareIcon className="h-4 w-4" />
            Look for Share at the bottom of your screen
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-gradient mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [androidManualHint, setAndroidManualHint] = useState(false);
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

    localStorage.removeItem("glamdcebu-pwa-install-dismissed");

    if (isIOS()) {
      setIosHint(true);
      setInAppBrowser(isInAppBrowser());
      setVisible(true);
      if (!sessionStorage.getItem("glamd-ios-install-guide")) {
        sessionStorage.setItem("glamd-ios-install-guide", "1");
        setShowIosGuide(true);
      }
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
      setAndroidManualHint(false);
      setVisible(true);
    };

    window.addEventListener(PWA_INSTALL_READY_EVENT, onReady);

    const fallbackTimer = window.setTimeout(() => {
      setAndroidManualHint((prev) => prev || !getDeferredInstallPrompt());
      setVisible(true);
    }, 2500);

    return () => {
      window.removeEventListener(PWA_INSTALL_READY_EVENT, onReady);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIosGuide(false);
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

  if (!visible && !showIosGuide) return null;

  const iosSafari = isIOSSafari();

  return (
    <>
      {showIosGuide && (
        <IOSInstallGuide
          siteTitle={siteTitle}
          inAppBrowser={inAppBrowser}
          onClose={() => setShowIosGuide(false)}
        />
      )}

      {visible && (
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
                  ? inAppBrowser
                    ? "Open in Safari first to install"
                    : "Use Safari's Share button at the bottom"
                  : androidManualHint && !deferredPrompt
                    ? "Menu (⋮) → Install app"
                    : "Quick access from your home screen"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {iosHint ? (
                <button
                  type="button"
                  onClick={() => setShowIosGuide(true)}
                  className="btn-gradient rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                >
                  How to
                </button>
              ) : (
                deferredPrompt && (
                  <button
                    type="button"
                    onClick={install}
                    className="btn-gradient rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                  >
                    Install
                  </button>
                )
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

          {iosHint && iosSafari && !showIosGuide && (
            <p className="pointer-events-none mx-auto mt-2 max-w-lg text-center text-[10px] text-brand-muted">
              ↓ Share is in Safari&apos;s bar below, not on this card
            </p>
          )}
        </div>
      )}
    </>
  );
}
