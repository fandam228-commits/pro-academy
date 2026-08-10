"use client";

type Listener = (available: boolean) => void;

let deferredPrompt: any = null;
let initialized = false;
const listeners = new Set<Listener>();

function emit() {
  const available = !!deferredPrompt;
  listeners.forEach((l) => l(available));
}

/** Starts capturing the browser install prompt (call once, early). */
export function initInstallCapture() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });
}

export function isPromptAvailable(): boolean {
  return !!deferredPrompt;
}

export function subscribeInstall(listener: Listener): () => void {
  listeners.add(listener);
  listener(!!deferredPrompt);
  return () => listeners.delete(listener);
}

/** Triggers the native install dialog. Returns true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  try {
    const choice = await deferredPrompt.userChoice;
    const accepted = choice?.outcome === "accepted";
    if (accepted) {
      deferredPrompt = null;
      emit();
    }
    return accepted;
  } catch {
    return false;
  }
}

/** True when the app is already running as an installed standalone app. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

export type DeviceKind = "android" | "ios" | "desktop";

export function detectDevice(): DeviceKind {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
