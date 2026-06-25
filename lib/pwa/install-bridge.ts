export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWA_INSTALL_READY_EVENT = "glamd-pwa-install-ready";

declare global {
  interface Window {
    __glamdPwaInstall?: {
      deferred: BeforeInstallPromptEvent | null;
    };
  }
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return window.__glamdPwaInstall?.deferred ?? null;
}
