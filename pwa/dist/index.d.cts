//#region src/index.d.ts
type InstallOutcome = "accepted" | "dismissed" | "unavailable";
interface RegisterSWOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: unknown) => void;
}
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
}
/**
 * Register a Service Worker at `url`. Returns a Promise that resolves to
 * the ServiceWorkerRegistration or undefined (if SW is not supported).
 */
declare function registerSW(url: string, options?: RegisterSWOptions): Promise<ServiceWorkerRegistration | undefined>;
/**
 * Subscribe to the `beforeinstallprompt` event.
 * The callback is called immediately if the event has already fired.
 * Returns a cleanup function.
 */
declare function onInstallPrompt(cb: (e: BeforeInstallPromptEvent) => void): () => void;
/**
 * Trigger the native install dialog.
 * Returns the outcome: `'accepted'`, `'dismissed'`, or `'unavailable'`
 * (when no prompt is available).
 */
declare function promptInstall(): Promise<InstallOutcome>;
/**
 * Returns `true` if the browser is currently online.
 */
declare function isOnline(): boolean;
/**
 * Subscribe to the `offline` event. Returns a cleanup function.
 */
declare function onOffline(cb: () => void): () => void;
/**
 * Subscribe to the `online` event. Returns a cleanup function.
 */
declare function onOnline(cb: () => void): () => void;
/**
 * Watch a ServiceWorkerRegistration for an available update.
 * Calls `cb(registration)` when a new SW is waiting.
 * Returns a cleanup function.
 */
declare function onUpdateAvailable(reg: ServiceWorkerRegistration, cb: (reg: ServiceWorkerRegistration) => void): () => void;
/**
 * Tell the waiting Service Worker to skip waiting and take control.
 * Reloads the page once it becomes the active controller.
 */
declare function activateUpdate(reg: ServiceWorkerRegistration): void;
//#endregion
export { InstallOutcome, RegisterSWOptions, activateUpdate, isOnline, onInstallPrompt, onOffline, onOnline, onUpdateAvailable, promptInstall, registerSW };