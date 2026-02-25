import { emit, provide } from "@lopatnov/namespace";

//#region src/index.ts
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
/** Stop the router — remove all listeners and cleanup current route. */
function stop(router) {
	router.unlisten?.();
	router.unlisten = null;
	router.currentCleanup?.();
	router.currentCleanup = null;
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
/** Go back in browser history. */
function back() {
	window.history.back();
}
/** Go forward in browser history. */
function forward() {
	window.history.forward();
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
export { back, createRouter, forward, getCurrentPath, lazyRoute, navigate, route, start, stop };