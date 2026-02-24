// --- Types ---

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export interface RegisterSWOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: unknown) => void;
}

// --- Internal state ---

let _deferredPrompt: BeforeInstallPromptEvent | null = null;
let _installListeners: Array<(e: BeforeInstallPromptEvent) => void> = [];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
    for (const cb of _installListeners) cb(_deferredPrompt);
  });
}

// --- Service Worker ---

/**
 * Register a Service Worker at `url`. Returns a Promise that resolves to
 * the ServiceWorkerRegistration or undefined (if SW is not supported).
 */
export async function registerSW(
  url: string,
  options: RegisterSWOptions = {},
): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return undefined;
  }
  try {
    const reg = await navigator.serviceWorker.register(url);
    options.onSuccess?.(reg);
    return reg;
  } catch (err) {
    options.onError?.(err);
    return undefined;
  }
}

// --- Install prompt ---

/**
 * Subscribe to the `beforeinstallprompt` event.
 * The callback is called immediately if the event has already fired.
 * Returns a cleanup function.
 */
export function onInstallPrompt(cb: (e: BeforeInstallPromptEvent) => void): () => void {
  if (_deferredPrompt) {
    cb(_deferredPrompt);
  }
  _installListeners.push(cb);
  return () => {
    _installListeners = _installListeners.filter((fn) => fn !== cb);
  };
}

/**
 * Trigger the native install dialog.
 * Returns the outcome: `'accepted'`, `'dismissed'`, or `'unavailable'`
 * (when no prompt is available).
 */
export async function promptInstall(): Promise<InstallOutcome> {
  if (!_deferredPrompt) return "unavailable";
  await _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  return outcome;
}

// --- Network status ---

/**
 * Returns `true` if the browser is currently online.
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Subscribe to the `offline` event. Returns a cleanup function.
 */
export function onOffline(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("offline", cb);
  return () => window.removeEventListener("offline", cb);
}

/**
 * Subscribe to the `online` event. Returns a cleanup function.
 */
export function onOnline(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", cb);
  return () => window.removeEventListener("online", cb);
}

// --- SW updates ---

/**
 * Watch a ServiceWorkerRegistration for an available update.
 * Calls `cb(registration)` when a new SW is waiting.
 * Returns a cleanup function.
 */
export function onUpdateAvailable(
  reg: ServiceWorkerRegistration,
  cb: (reg: ServiceWorkerRegistration) => void,
): () => void {
  function handleUpdateFound() {
    const installing = reg.installing;
    if (!installing) return;
    function handleStateChange() {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        cb(reg);
      }
    }
    installing.addEventListener("statechange", handleStateChange);
  }
  reg.addEventListener("updatefound", handleUpdateFound);
  return () => reg.removeEventListener("updatefound", handleUpdateFound);
}

/**
 * Tell the waiting Service Worker to skip waiting and take control.
 * Reloads the page once it becomes the active controller.
 */
export function activateUpdate(reg: ServiceWorkerRegistration): void {
  if (!reg.waiting) return;
  reg.waiting.postMessage({ type: "SKIP_WAITING" });

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  function handleControllerChange() {
    navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    window.location.reload();
  }
  navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
}
