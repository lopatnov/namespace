Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let _lopatnov_namespace = require("@lopatnov/namespace");

//#region src/index.ts
const _routerGuards = /* @__PURE__ */ new WeakMap();
const _protections = /* @__PURE__ */ new WeakMap();
function compilePattern(pattern) {
	const regexStr = pattern.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/:(\w+)/g, "([^/]+)").replace(/\*/g, ".*");
	return new RegExp(`^${regexStr}$`);
}
/**
* Register a route guard. The guard function is called synchronously before
* every navigation to a path matching `pattern`.
*
* - Return `true` to allow navigation.
* - Return `false` to cancel navigation (URL stays on current page).
* - Return a path string to redirect.
*
* Patterns support `:param` and `*` wildcard (same as `route()`).
* Returns an unsubscribe function.
*
* @example
* guard(router, '/admin/*', ({ path }) => {
*   return get(app, 'user.isAdmin') ? true : '/login';
* });
*/
function guard(router, pattern, fn) {
	if (!_routerGuards.has(router)) {
		_routerGuards.set(router, []);
		(0, _lopatnov_namespace.on)(router.ns, "router:beforeNavigate", (nav) => {
			const navObj = nav;
			if (navObj.cancelled || navObj.redirectTo !== null) return;
			const entries = _routerGuards.get(router) ?? [];
			for (const entry of entries) {
				if (!entry.regex.test(navObj.path)) continue;
				const result = entry.fn({
					path: navObj.path,
					query: navObj.query
				});
				if (result === false) {
					navObj.cancelled = true;
					return;
				}
				if (typeof result === "string") {
					navObj.redirectTo = result;
					return;
				}
			}
		});
	}
	const entry = {
		regex: compilePattern(pattern),
		fn
	};
	_routerGuards.get(router).push(entry);
	return () => {
		const list = _routerGuards.get(router);
		if (list) {
			const idx = list.indexOf(entry);
			if (idx !== -1) list.splice(idx, 1);
		}
	};
}
/**
* Protect a namespace key with an access check function.
* Multiple protections on the same key are AND-combined.
* Returns an unsubscribe function.
*
* @example
* protect(app.ns, 'payment', () => !!get(app.ns, 'user'));
*/
function protect(ns, key, fn) {
	let map = _protections.get(ns);
	if (!map) {
		map = /* @__PURE__ */ new Map();
		_protections.set(ns, map);
	}
	let fns = map.get(key);
	if (!fns) {
		fns = [];
		map.set(key, fns);
	}
	fns.push(fn);
	return () => {
		const fnsArr = _protections.get(ns)?.get(key);
		if (fnsArr) {
			const idx = fnsArr.indexOf(fn);
			if (idx !== -1) fnsArr.splice(idx, 1);
		}
	};
}
/**
* Check whether access to a protected namespace key is allowed.
* Returns `true` if no protections are registered, or if all registered
* protection functions return `true`.
*
* @example
* if (allowed(app.ns, 'payment')) {
*   const svc = get(app.ns, 'payment');
* }
*/
function allowed(ns, key) {
	const fns = _protections.get(ns)?.get(key);
	if (!fns || fns.length === 0) return true;
	return fns.every((fn) => fn());
}

//#endregion
exports.allowed = allowed;
exports.guard = guard;
exports.protect = protect;