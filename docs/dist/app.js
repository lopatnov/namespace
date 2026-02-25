//#region ../namespace/src/index.ts
const _ns = /* @__PURE__ */ new WeakMap();
/** Create a new root namespace. */
function createNamespace() {
	const ns = Object.create(null);
	_ns.set(ns, {
		store: /* @__PURE__ */ new Map(),
		events: /* @__PURE__ */ new Map(),
		parent: null,
		path: ""
	});
	return ns;
}
/** Register a value under a key. Supports dot-paths: `set(ns, 'a.b.c', value)`. */
function set(ns, key, value) {
	const parts = parsePath(key);
	const meta = getMeta(ns);
	if (parts.length === 1) {
		const old = meta.store.get(parts[0]);
		meta.store.set(parts[0], value);
		emit(ns, "change", key, value, old);
		return;
	}
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) current = ensureChild(current, parts[i]);
	const leaf = parts[parts.length - 1];
	const currentMeta = getMeta(current);
	const old = currentMeta.store.get(leaf);
	currentMeta.store.set(leaf, value);
	const fullPath = buildPath(current, leaf);
	emitUp(current, "change", fullPath, value, old);
}
/** Retrieve a value by key. Returns `undefined` if not found. */
function get(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = getMeta(current).store.get(parts[i]);
		if (!isNamespace(child)) return void 0;
		current = child;
	}
	return getMeta(current).store.get(parts[parts.length - 1]);
}
/** Subscribe to an event. Returns an unsubscribe function. */
function on(ns, event, handler) {
	const meta = getMeta(ns);
	let handlers = meta.events.get(event);
	if (!handlers) {
		handlers = /* @__PURE__ */ new Set();
		meta.events.set(event, handlers);
	}
	handlers.add(handler);
	return () => {
		handlers.delete(handler);
		if (handlers.size === 0) meta.events.delete(event);
	};
}
/** Emit an event with arguments. */
function emit(ns, event, ...args) {
	const handlers = getMeta(ns).events.get(event);
	if (handlers) for (const handler of handlers) handler(...args);
}
function getMeta(ns) {
	const meta = _ns.get(ns);
	if (!meta) throw new Error("Invalid namespace object");
	return meta;
}
function parsePath(key) {
	const parts = key.split(".");
	if (parts.length === 0 || parts.some((p) => p === "")) throw new Error(`Invalid namespace path: "${key}"`);
	return parts;
}
function isNamespace(value) {
	return value !== null && typeof value === "object" && _ns.has(value);
}
function ensureChild(ns, key) {
	const meta = getMeta(ns);
	const existing = meta.store.get(key);
	if (isNamespace(existing)) return existing;
	const child = createNamespace();
	const childMeta = getMeta(child);
	childMeta.parent = ns;
	childMeta.path = meta.path ? `${meta.path}.${key}` : key;
	meta.store.set(key, child);
	return child;
}
function buildPath(ns, leaf) {
	const p = getMeta(ns).path;
	return p ? `${p}.${leaf}` : leaf;
}
function emitUp(currentNs, event, ...args) {
	emit(currentNs, event, ...args);
	let cursor = getMeta(currentNs).parent;
	while (cursor !== null) {
		emit(cursor, event, ...args);
		cursor = getMeta(cursor).parent;
	}
}

//#endregion
//#region ../pwa/src/index.ts
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

//#endregion
//#region ../router/src/index.ts
/** Create a router and register it in the namespace. */
function createRouter(ns, options = {}) {
	const router = {
		ns,
		routes: [],
		mode: options.mode ?? "hash",
		root: options.root ?? "#app",
		container: null,
		currentCleanup: null,
		currentPath: "",
		unlisten: null
	};
	set(ns, "router", router);
	return router;
}
/** Start the router — listen to URL changes and handle the current URL. */
function start(router) {
	if (typeof document === "undefined") return;
	router.container = document.querySelector(router.root);
	if (!router.container) throw new Error(`Router container not found: "${router.root}"`);
	if (router.mode === "history") {
		const handler = () => handleNavigation(router);
		window.addEventListener("popstate", handler);
		router.unlisten = () => window.removeEventListener("popstate", handler);
	} else {
		const handler = () => handleNavigation(router);
		window.addEventListener("hashchange", handler);
		router.unlisten = () => window.removeEventListener("hashchange", handler);
	}
	const clickHandler = (e) => {
		const target = e.target?.closest?.("[data-nav]");
		if (!target) return;
		const href = target.getAttribute("href");
		if (!href) return;
		e.preventDefault();
		navigate(router, href);
	};
	document.addEventListener("click", clickHandler);
	const originalUnlisten = router.unlisten;
	router.unlisten = () => {
		originalUnlisten?.();
		document.removeEventListener("click", clickHandler);
	};
	handleNavigation(router);
}
/** Register a route. */
function route(router, pattern, handler) {
	const { regex, paramNames } = compilePattern(pattern);
	router.routes.push({
		pattern,
		regex,
		paramNames,
		handler
	});
}
/** Navigate to a path programmatically. */
function navigate(router, path) {
	if (router.mode === "history") window.history.pushState(null, "", path);
	else {
		window.location.hash = path.startsWith("#") ? path : `#${path}`;
		return;
	}
	handleNavigation(router);
}
/** Create a lazy route handler from a dynamic import. */
function lazyRoute(loader) {
	let cached = null;
	return async (container, params, query) => {
		if (!cached) cached = (await loader()).default;
		const result = cached(container, params, query);
		return (result instanceof Promise ? await result : result) ?? void 0;
	};
}
function getPathFromURL(mode) {
	if (mode === "history") return window.location.pathname;
	const hash = window.location.hash;
	return hash ? hash.slice(1) : "/";
}
function compilePattern(pattern) {
	const paramNames = [];
	const regexStr = pattern.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/:(\w+)/g, (_, name) => {
		paramNames.push(name);
		return "([^/]+)";
	}).replace(/\*/g, ".*");
	return {
		regex: new RegExp(`^${regexStr}$`),
		paramNames
	};
}
function matchRoute(routes, path) {
	const pathOnly = path.split("?")[0];
	for (const entry of routes) {
		const match = pathOnly.match(entry.regex);
		if (match) {
			const params = {};
			entry.paramNames.forEach((name, i) => {
				params[name] = match[i + 1];
			});
			return {
				entry,
				params
			};
		}
	}
	return null;
}
async function handleNavigation(router) {
	const [pathOnly, queryStr] = getPathFromURL(router.mode).split("?");
	const query = new URLSearchParams(queryStr ?? "");
	if (pathOnly === router.currentPath) return;
	const nav = {
		path: pathOnly,
		query,
		cancelled: false,
		redirectTo: null
	};
	emit(router.ns, "router:beforeNavigate", nav);
	if (nav.cancelled) {
		if (router.mode === "history") window.history.replaceState(null, "", router.currentPath || "/");
		else {
			const cur = router.currentPath || "/";
			window.location.hash = cur.startsWith("#") ? cur : `#${cur}`;
		}
		return;
	}
	if (nav.redirectTo) {
		navigate(router, nav.redirectTo);
		return;
	}
	router.currentCleanup?.();
	router.currentCleanup = null;
	router.currentPath = pathOnly;
	const matched = matchRoute(router.routes, pathOnly);
	if (!matched) {
		const notFound = matchRoute(router.routes, "*");
		if (notFound && router.container) {
			const cleanup = await notFound.entry.handler(router.container, {}, query);
			if (typeof cleanup === "function") router.currentCleanup = cleanup;
		}
		emit(router.ns, "router:notfound", pathOnly);
		return;
	}
	if (!router.container) return;
	emit(router.ns, "router:before", pathOnly, matched.params);
	try {
		const cleanup = await matched.entry.handler(router.container, matched.params, query);
		if (typeof cleanup === "function") router.currentCleanup = cleanup;
		emit(router.ns, "router:after", pathOnly, matched.params);
	} catch (err) {
		emit(router.ns, "router:error", pathOnly, err);
	}
}

//#endregion
//#region src/ns.ts
const app = createNamespace();

//#endregion
//#region src/sidebar.html
var sidebar_default = "<a class=\"logo\" href=\"#/\" data-nav>@lopatnov/namespace</a>\r\n<nav class=\"nav flex-column\">\r\n  <a class=\"nav-link\" href=\"/\" data-nav><i class=\"bi bi-house me-2\"></i>Home</a>\r\n\r\n  <div class=\"section-title\">Namespace</div>\r\n  <a class=\"nav-link\" href=\"/namespace\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/createNamespace\" data-nav>createNamespace</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/set\" data-nav>set / get</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/has\" data-nav>has / remove / keys</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/on\" data-nav>on / off / emit</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/scope\" data-nav>scope / root / parent</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/toJSON\" data-nav>toJSON / clone / extend</a>\r\n  <a class=\"nav-link sub\" href=\"/namespace/createApp\" data-nav>createApp / App</a>\r\n\r\n  <div class=\"section-title\">Router</div>\r\n  <a class=\"nav-link\" href=\"/router\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/router/createRouter\" data-nav>createRouter / start</a>\r\n  <a class=\"nav-link sub\" href=\"/router/route\" data-nav>route / navigate</a>\r\n  <a class=\"nav-link sub\" href=\"/router/lazyRoute\" data-nav>lazyRoute</a>\r\n  <a class=\"nav-link sub\" href=\"/router/back\" data-nav>back / forward</a>\r\n\r\n  <div class=\"section-title\">Plugin</div>\r\n  <a class=\"nav-link\" href=\"/plugin\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/plugin/definePlugin\" data-nav>definePlugin / usePlugin</a>\r\n  <a class=\"nav-link sub\" href=\"/plugin/installed\" data-nav>installed / uninstallPlugin</a>\r\n\r\n  <div class=\"section-title\">Storage</div>\r\n  <a class=\"nav-link\" href=\"/storage\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/storage/persist\" data-nav>persist / restore</a>\r\n  <a class=\"nav-link sub\" href=\"/storage/createIndexedDB\" data-nav>createIndexedDB</a>\r\n\r\n  <div class=\"section-title\">Guards</div>\r\n  <a class=\"nav-link\" href=\"/guards\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/guards/guard\" data-nav>guard</a>\r\n  <a class=\"nav-link sub\" href=\"/guards/protect\" data-nav>protect / allowed</a>\r\n\r\n  <div class=\"section-title\">MVVM</div>\r\n  <a class=\"nav-link\" href=\"/mvvm\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/reactive\" data-nav>reactive</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/bind\" data-nav>bind</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/text-html\" data-nav>text / html</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/visible-if\" data-nav>visible / if</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/value-checked\" data-nav>value / checked</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/css-attr\" data-nav>css / attr</a>\r\n  <a class=\"nav-link sub\" href=\"/mvvm/event-foreach\" data-nav>event / foreach</a>\r\n\r\n  <div class=\"section-title\">PWA</div>\r\n  <a class=\"nav-link\" href=\"/pwa\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/pwa/registerSW\" data-nav>registerSW</a>\r\n  <a class=\"nav-link sub\" href=\"/pwa/install-prompt\" data-nav>onInstallPrompt / promptInstall</a>\r\n  <a class=\"nav-link sub\" href=\"/pwa/network-status\" data-nav>isOnline / onOffline / onOnline</a>\r\n  <a class=\"nav-link sub\" href=\"/pwa/sw-updates\" data-nav>onUpdateAvailable / activateUpdate</a>\r\n\r\n  <div class=\"section-title\">Component</div>\r\n  <a class=\"nav-link\" href=\"/component\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/component/defineComponent\" data-nav>defineComponent</a>\r\n  <a class=\"nav-link sub\" href=\"/component/mount\" data-nav>mount</a>\r\n\r\n  <div class=\"section-title\">Microfrontends</div>\r\n  <a class=\"nav-link\" href=\"/microfrontends\" data-nav>Overview</a>\r\n  <a class=\"nav-link sub\" href=\"/microfrontends/createBus\" data-nav>createBus</a>\r\n  <a class=\"nav-link sub\" href=\"/microfrontends/leaderElection\" data-nav>leaderElection</a>\r\n\r\n  <div class=\"section-title\">Examples</div>\r\n  <a class=\"nav-link\" href=\"/examples/capitals\" data-nav><i class=\"bi bi-globe me-1\"></i>World Capitals</a>\r\n  <a class=\"nav-link\" href=\"/examples/microfrontends\" data-nav><i class=\"bi bi-broadcast me-1\"></i>Microfrontends</a>\r\n\r\n  <hr class=\"mx-3 my-2\" />\r\n  <a class=\"nav-link\" href=\"/about\" data-nav><i class=\"bi bi-info-circle me-1\"></i>About</a>\r\n  <a class=\"nav-link\" href=\"https://github.com/lopatnov/namespace\" target=\"_blank\">\r\n    <i class=\"bi bi-github me-1\"></i>GitHub <i class=\"bi bi-box-arrow-up-right\" style=\"font-size:0.7rem\"></i>\r\n  </a>\r\n</nav>\r\n";

//#endregion
//#region src/app.ts
const router = createRouter(app, {
	mode: "hash",
	root: "#app"
});
$("#sidebar-desktop").html(sidebar_default);
$("#sidebar-mobile").html(sidebar_default);
route(router, "/", lazyRoute(() => import("./home-hlORfASe.js")));
route(router, "/namespace", lazyRoute(() => import("./namespace-overview-CO8hFz-J.js")));
route(router, "/namespace/:method", lazyRoute(() => import("./namespace-method-Bsh-01o7.js")));
route(router, "/router", lazyRoute(() => import("./router-overview-BluErIuL.js")));
route(router, "/router/:method", lazyRoute(() => import("./router-method-DnCvrsse.js")));
route(router, "/plugin", lazyRoute(() => import("./plugin-overview-CJUDyW9d.js")));
route(router, "/plugin/:method", lazyRoute(() => import("./plugin-method-BcnOXabh.js")));
route(router, "/storage", lazyRoute(() => import("./storage-overview-CjHaNidP.js")));
route(router, "/storage/:method", lazyRoute(() => import("./storage-method-DbBgGP5c.js")));
route(router, "/guards", lazyRoute(() => import("./guards-overview-QgdPqp5F.js")));
route(router, "/guards/:method", lazyRoute(() => import("./guards-method-Bak1XTUc.js")));
route(router, "/mvvm", lazyRoute(() => import("./mvvm-overview-yMtgi-d9.js")));
route(router, "/mvvm/:method", lazyRoute(() => import("./mvvm-method-DzFXhyAf.js")));
route(router, "/pwa", lazyRoute(() => import("./pwa-overview-BYuGIeXn.js")));
route(router, "/pwa/:method", lazyRoute(() => import("./pwa-method-C7NG6k_k.js")));
route(router, "/component", lazyRoute(() => import("./component-overview-BhWC8aBC.js")));
route(router, "/component/:method", lazyRoute(() => import("./component-method-DQbbdzq7.js")));
route(router, "/microfrontends", lazyRoute(() => import("./microfrontends-overview-CkosCA5u.js")));
route(router, "/microfrontends/:method", lazyRoute(() => import("./microfrontends-method-Bmn5aVNG.js")));
route(router, "/examples/capitals", lazyRoute(() => import("./capitals-DPyXmcOw.js")));
route(router, "/examples/capitals/:id", lazyRoute(() => import("./capital-detail-Byb01z75.js")));
route(router, "/examples/microfrontends", lazyRoute(() => import("./mfe-demo-G-NHRN9v.js")));
route(router, "/about", lazyRoute(() => import("./about-DxqSnmvA.js")));
on(app, "router:after", (path) => {
	$("[data-nav]").removeClass("active");
	$(`[data-nav][href="${path}"]`).addClass("active");
	const offcanvasEl = document.getElementById("sidebarOffcanvas");
	if (offcanvasEl) bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
	window.scrollTo(0, 0);
});
start(router);
registerSW("./sw.js");
onOffline(() => {
	$("#offline-banner").removeClass("d-none");
});
onOnline(() => {
	$("#offline-banner").addClass("d-none");
});

//#endregion
export { on as i, navigate as n, get as r, app as t };