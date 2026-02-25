//#region src/index.ts
let _deferredPrompt = null;
let _installListeners = [];
if (typeof window !== "undefined") window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	_deferredPrompt = e;
	for (const cb of _installListeners) cb(_deferredPrompt);
});
/**
* Register a Service Worker at `url`. Returns a Promise that resolves to
* the ServiceWorkerRegistration or undefined (if SW is not supported).
*/
async function registerSW(url, options = {}) {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
	try {
		const reg = await navigator.serviceWorker.register(url);
		options.onSuccess?.(reg);
		return reg;
	} catch (err) {
		options.onError?.(err);
		return;
	}
}
/**
* Subscribe to the `beforeinstallprompt` event.
* The callback is called immediately if the event has already fired.
* Returns a cleanup function.
*/
function onInstallPrompt(cb) {
	if (_deferredPrompt) cb(_deferredPrompt);
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
async function promptInstall() {
	if (!_deferredPrompt) return "unavailable";
	await _deferredPrompt.prompt();
	const { outcome } = await _deferredPrompt.userChoice;
	_deferredPrompt = null;
	return outcome;
}
/**
* Returns `true` if the browser is currently online.
*/
function isOnline() {
	if (typeof navigator === "undefined") return true;
	return navigator.onLine;
}
/**
* Subscribe to the `offline` event. Returns a cleanup function.
*/
function onOffline(cb) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener("offline", cb);
	return () => window.removeEventListener("offline", cb);
}
/**
* Subscribe to the `online` event. Returns a cleanup function.
*/
function onOnline(cb) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener("online", cb);
	return () => window.removeEventListener("online", cb);
}
/**
* Watch a ServiceWorkerRegistration for an available update.
* Calls `cb(registration)` when a new SW is waiting.
* Returns a cleanup function.
*/
function onUpdateAvailable(reg, cb) {
	function handleUpdateFound() {
		const installing = reg.installing;
		if (!installing) return;
		function handleStateChange() {
			if (installing.state === "installed" && navigator.serviceWorker.controller) cb(reg);
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
function activateUpdate(reg) {
	if (!reg.waiting) return;
	reg.waiting.postMessage({ type: "SKIP_WAITING" });
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
	function handleControllerChange() {
		navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
		window.location.reload();
	}
	navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
}

//#endregion
export { activateUpdate, isOnline, onInstallPrompt, onOffline, onOnline, onUpdateAvailable, promptInstall, registerSW };