//#region ../namespace/src/index.ts
const STORE = Symbol("ns.store");
const EVENTS = Symbol("ns.events");
const PARENT = Symbol("ns.parent");
const PATH = Symbol("ns.path");
/** Create a new root namespace. */
function createNamespace() {
	return {
		[STORE]: /* @__PURE__ */ new Map(),
		[EVENTS]: /* @__PURE__ */ new Map(),
		[PARENT]: null,
		[PATH]: ""
	};
}
/** Register a value under a key. Supports dot-paths: `provide(ns, 'a.b.c', value)`. */
function provide(ns, key, value) {
	const parts = parsePath(key);
	if (parts.length === 1) {
		const old = ns[STORE].get(parts[0]);
		ns[STORE].set(parts[0], value);
		emit(ns, "change", key, value, old);
		return;
	}
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) current = ensureChild(current, parts[i]);
	const leaf = parts[parts.length - 1];
	const old = current[STORE].get(leaf);
	current[STORE].set(leaf, value);
	const fullPath = buildPath(current, leaf);
	emitUp(ns, current, "change", fullPath, value, old);
}
/** Retrieve a value by key. Returns `undefined` if not found. */
function inject(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = current[STORE].get(parts[i]);
		if (!isNamespace(child)) return void 0;
		current = child;
	}
	return current[STORE].get(parts[parts.length - 1]);
}
/** Subscribe to an event. Returns an unsubscribe function. */
function on(ns, event, handler) {
	let handlers = ns[EVENTS].get(event);
	if (!handlers) {
		handlers = /* @__PURE__ */ new Set();
		ns[EVENTS].set(event, handlers);
	}
	handlers.add(handler);
	return () => {
		handlers.delete(handler);
		if (handlers.size === 0) ns[EVENTS].delete(event);
	};
}
/** Emit an event with arguments. */
function emit(ns, event, ...args) {
	const handlers = ns[EVENTS].get(event);
	if (handlers) for (const handler of handlers) handler(...args);
}
function parsePath(key) {
	const parts = key.split(".");
	if (parts.length === 0 || parts.some((p) => p === "")) throw new Error(`Invalid namespace path: "${key}"`);
	return parts;
}
function isNamespace(value) {
	return value !== null && typeof value === "object" && STORE in value;
}
function ensureChild(ns, key) {
	const existing = ns[STORE].get(key);
	if (isNamespace(existing)) return existing;
	const child = {
		[STORE]: /* @__PURE__ */ new Map(),
		[EVENTS]: /* @__PURE__ */ new Map(),
		[PARENT]: ns,
		[PATH]: ns[PATH] ? `${ns[PATH]}.${key}` : key
	};
	ns[STORE].set(key, child);
	return child;
}
function buildPath(ns, leaf) {
	return ns[PATH] ? `${ns[PATH]}.${leaf}` : leaf;
}
function emitUp(rootNs, currentNs, event, ...args) {
	emit(currentNs, event, ...args);
	let cursor = currentNs[PARENT];
	while (cursor !== null) {
		emit(cursor, event, ...args);
		cursor = cursor[PARENT];
	}
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
	provide(ns, "router", router);
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
/** Get the current route path. */
function getCurrentPath(router) {
	return router.currentPath;
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
//#region src/app.ts
const router = createRouter(app, {
	mode: "hash",
	root: "#app"
});
const sidebarHTML = `
  <a class="logo" href="#/" data-nav>@lopatnov/namespace</a>
  <nav class="nav flex-column">
    <a class="nav-link" href="/" data-nav><i class="bi bi-house me-2"></i>Home</a>

    <div class="section-title">Namespace</div>
    <a class="nav-link" href="/namespace" data-nav>Overview</a>
    <a class="nav-link sub" href="/namespace/createNamespace" data-nav>createNamespace</a>
    <a class="nav-link sub" href="/namespace/provide" data-nav>provide / inject</a>
    <a class="nav-link sub" href="/namespace/has" data-nav>has / remove / keys</a>
    <a class="nav-link sub" href="/namespace/on" data-nav>on / off / emit</a>
    <a class="nav-link sub" href="/namespace/scope" data-nav>scope / root / parent</a>
    <a class="nav-link sub" href="/namespace/toJSON" data-nav>toJSON / clone / merge</a>

    <div class="section-title">Router</div>
    <a class="nav-link" href="/router" data-nav>Overview</a>
    <a class="nav-link sub" href="/router/createRouter" data-nav>createRouter / start</a>
    <a class="nav-link sub" href="/router/route" data-nav>route / navigate</a>
    <a class="nav-link sub" href="/router/lazyRoute" data-nav>lazyRoute</a>
    <a class="nav-link sub" href="/router/back" data-nav>back / forward</a>

    <div class="section-title">Modules</div>
    <a class="nav-link" href="/mvvm" data-nav>MVVM <span class="badge bg-secondary badge-soon">soon</span></a>
    <a class="nav-link" href="/component" data-nav>Components <span class="badge bg-secondary badge-soon">soon</span></a>
    <a class="nav-link" href="/plugin" data-nav>Plugins <span class="badge bg-secondary badge-soon">soon</span></a>

    <div class="section-title">Examples</div>
    <a class="nav-link" href="/examples/capitals" data-nav><i class="bi bi-globe me-1"></i>World Capitals</a>

    <hr class="mx-3 my-2" />
    <a class="nav-link" href="/about" data-nav><i class="bi bi-info-circle me-1"></i>About</a>
    <a class="nav-link" href="https://github.com/lopatnov/namespace" target="_blank">
      <i class="bi bi-github me-1"></i>GitHub <i class="bi bi-box-arrow-up-right" style="font-size:0.7rem"></i>
    </a>
  </nav>
`;
$("#sidebar-desktop").html(sidebarHTML);
$("#sidebar-mobile").html(sidebarHTML);
route(router, "/", lazyRoute(() => import("./home-WFbBsXHK.js")));
route(router, "/namespace", lazyRoute(() => import("./namespace-overview-DhJEoxKR.js")));
route(router, "/namespace/:method", lazyRoute(() => import("./namespace-method-DDessNRy.js")));
route(router, "/router", lazyRoute(() => import("./router-overview-Bwnmk4va.js")));
route(router, "/router/:method", lazyRoute(() => import("./router-method-CDpgvwyv.js")));
route(router, "/mvvm", lazyRoute(() => import("./placeholder-s56j8nQE.js")));
route(router, "/component", lazyRoute(() => import("./placeholder-s56j8nQE.js")));
route(router, "/plugin", lazyRoute(() => import("./placeholder-s56j8nQE.js")));
route(router, "/examples/capitals", lazyRoute(() => import("./capitals-BYENxhV5.js")));
route(router, "/examples/capitals/:id", lazyRoute(() => import("./capital-detail-BlQycVrG.js")));
route(router, "/about", lazyRoute(() => import("./about-DUAIsW2U.js")));
on(app, "router:after", (path) => {
	$("[data-nav]").removeClass("active");
	$(`[data-nav][href="${path}"]`).addClass("active");
	const offcanvasEl = document.getElementById("sidebarOffcanvas");
	if (offcanvasEl) bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
	window.scrollTo(0, 0);
});
start(router);

//#endregion
export { inject as i, getCurrentPath as n, navigate as r, app as t };