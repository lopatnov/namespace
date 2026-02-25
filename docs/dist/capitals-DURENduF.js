import { n as navigate, r as inject, t as app } from "./app.js";
import { t as capitals } from "./capitals-UjdBUCGU.js";

//#region ../mvvm/src/index.ts
let _activeEffect = null;
let _activeDeps = null;
function track(depMap, key) {
	if (!_activeEffect) return;
	let dep = depMap.get(key);
	if (!dep) {
		dep = /* @__PURE__ */ new Set();
		depMap.set(key, dep);
	}
	dep.add(_activeEffect);
	_activeDeps?.add(dep);
}
function trigger(depMap, key) {
	const dep = depMap.get(key);
	if (dep) for (const effect of [...dep]) effect();
}
const _proxyCache = /* @__PURE__ */ new WeakMap();
/**
* Create a reactive proxy. Property reads inside active effects are tracked
* as dependencies. Assignments notify dependents automatically.
*
* Note: For arrays, in-place mutations (push, pop, splice…) do not
* auto-trigger dependent effects. Use immutable style instead:
*   `state.items = [...state.items, newItem]`
*
* @example
* const state = reactive({ count: 0, user: { name: 'Alice' } });
* state.count++;  // effects depending on count re-run
*/
function reactive(obj) {
	if (_proxyCache.has(obj)) return _proxyCache.get(obj);
	const depMap = /* @__PURE__ */ new Map();
	const proxy = new Proxy(obj, {
		get(target, key, receiver) {
			if (typeof key === "string" || typeof key === "symbol") track(depMap, key);
			const value = Reflect.get(target, key, receiver);
			if (value !== null && typeof value === "object") return reactive(value);
			return value;
		},
		set(target, key, value, receiver) {
			const result = Reflect.set(target, key, value, receiver);
			if (typeof key === "string" || typeof key === "symbol") trigger(depMap, key);
			return result;
		}
	});
	_proxyCache.set(obj, proxy);
	return proxy;
}
/**
* Create a reactive effect. Runs immediately, then re-runs whenever any
* reactive property accessed during its execution changes.
* Returns a cleanup function that removes the effect from all subscriptions.
*/
function createEffect(fn) {
	const subscribedDeps = /* @__PURE__ */ new Set();
	const effect = () => {
		for (const dep of subscribedDeps) dep.delete(effect);
		subscribedDeps.clear();
		const prevEffect = _activeEffect;
		const prevDeps = _activeDeps;
		_activeEffect = effect;
		_activeDeps = subscribedDeps;
		try {
			fn();
		} finally {
			_activeEffect = prevEffect;
			_activeDeps = prevDeps;
		}
	};
	effect();
	return () => {
		for (const dep of subscribedDeps) dep.delete(effect);
		subscribedDeps.clear();
	};
}
function evalExpr(expr, state) {
	try {
		return new Function("$data", `with($data){return(${expr});}`)(state);
	} catch {
		return;
	}
}
/**
* Parse a data-bind string into a map of binding type → expression string.
* Handles nested braces/brackets/parens, so objects and arrays in
* expressions are correctly delimited.
*
* Examples:
*   "text: name"                        → { text: "name" }
*   "visible: isAdmin, css: { x: flag}" → { visible: "isAdmin", css: "{ x: flag }" }
*/
function parseBindings(bindStr) {
	const result = {};
	let remaining = bindStr.trim();
	while (remaining.length > 0) {
		const colonIdx = remaining.indexOf(":");
		if (colonIdx === -1) break;
		const key = remaining.slice(0, colonIdx).trim();
		remaining = remaining.slice(colonIdx + 1).trim();
		let depth = 0;
		let inStr = null;
		let i = 0;
		for (; i < remaining.length; i++) {
			const ch = remaining[i];
			if (inStr) {
				if (ch === inStr && remaining[i - 1] !== "\\") inStr = null;
			} else if (ch === "\"" || ch === "'" || ch === "`") inStr = ch;
			else if (ch === "{" || ch === "[" || ch === "(") depth++;
			else if (ch === "}" || ch === "]" || ch === ")") depth--;
			else if (ch === "," && depth === 0) break;
		}
		result[key] = remaining.slice(0, i).trim();
		remaining = remaining.slice(i + 1).trim();
	}
	return result;
}
function bindElement(el, state) {
	const cleanups = [];
	const bindAttr = el.getAttribute("data-bind");
	if (bindAttr) {
		const bindings = parseBindings(bindAttr);
		for (const [type, expr] of Object.entries(bindings)) applyBinding(type, expr, el, state, cleanups);
	}
	if (!el.getAttribute("data-bind")?.includes("foreach:")) for (const child of Array.from(el.children)) cleanups.push(bindElement(child, state));
	return () => {
		for (const fn of cleanups) fn();
	};
}
function applyBinding(type, expr, el, state, cleanups) {
	switch (type) {
		case "text":
			cleanups.push(createEffect(() => {
				el.textContent = String(evalExpr(expr, state) ?? "");
			}));
			break;
		case "html":
			cleanups.push(createEffect(() => {
				el.innerHTML = String(evalExpr(expr, state) ?? "");
			}));
			break;
		case "visible":
			cleanups.push(createEffect(() => {
				el.style.display = evalExpr(expr, state) ? "" : "none";
			}));
			break;
		case "if":
			cleanups.push(createEffect(() => {
				el.style.display = evalExpr(expr, state) ? "" : "none";
			}));
			break;
		case "value": {
			cleanups.push(createEffect(() => {
				el.value = String(evalExpr(expr, state) ?? "");
			}));
			const writeHandler = (e) => {
				try {
					const val = e.target.value;
					new Function("$data", "v", `with($data){${expr}=v;}`)(state, val);
				} catch {}
			};
			el.addEventListener("input", writeHandler);
			el.addEventListener("change", writeHandler);
			cleanups.push(() => {
				el.removeEventListener("input", writeHandler);
				el.removeEventListener("change", writeHandler);
			});
			break;
		}
		case "checked": {
			cleanups.push(createEffect(() => {
				el.checked = Boolean(evalExpr(expr, state));
			}));
			const checkHandler = (e) => {
				try {
					const val = e.target.checked;
					new Function("$data", "v", `with($data){${expr}=v;}`)(state, val);
				} catch {}
			};
			el.addEventListener("change", checkHandler);
			cleanups.push(() => el.removeEventListener("change", checkHandler));
			break;
		}
		case "attr":
			cleanups.push(createEffect(() => {
				const attrs = evalExpr(expr, state);
				if (attrs && typeof attrs === "object") for (const [name, val] of Object.entries(attrs)) if (val === null || val === false || val === void 0) el.removeAttribute(name);
				else el.setAttribute(name, String(val));
			}));
			break;
		case "css":
			cleanups.push(createEffect(() => {
				const classes = evalExpr(expr, state);
				if (classes && typeof classes === "object") for (const [cls, active] of Object.entries(classes)) el.classList.toggle(cls, Boolean(active));
			}));
			break;
		case "event": {
			const handlers = evalExpr(expr, state);
			if (handlers && typeof handlers === "object") {
				for (const [eventName, fn] of Object.entries(handlers)) if (typeof fn === "function") {
					const boundFn = fn.bind(state);
					el.addEventListener(eventName, boundFn);
					cleanups.push(() => el.removeEventListener(eventName, boundFn));
				}
			}
			break;
		}
		case "foreach": {
			const templateHTML = el.innerHTML;
			el.innerHTML = "";
			const itemCleanups = [];
			const stopEffect = createEffect(() => {
				for (const fn of itemCleanups) fn();
				itemCleanups.length = 0;
				el.innerHTML = "";
				const items = evalExpr(expr, state);
				if (!Array.isArray(items)) return;
				for (const item of items) {
					const itemState = typeof item === "object" && item !== null ? item : { $data: item };
					const wrapper = document.createElement("template");
					wrapper.innerHTML = templateHTML;
					for (const child of Array.from(wrapper.content.children)) {
						const cleanup = bindElement(child, itemState);
						itemCleanups.push(cleanup);
						el.appendChild(child);
					}
				}
			});
			cleanups.push(() => {
				stopEffect();
				for (const fn of itemCleanups) fn();
				itemCleanups.length = 0;
			});
			break;
		}
		default: break;
	}
}
/**
* Activate `data-bind` bindings on all elements within a DOM subtree.
* Returns a cleanup function that removes all active bindings.
*
* Supported bindings:
* - `text: expr`           → element.textContent
* - `html: expr`           → element.innerHTML
* - `visible: expr`        → CSS display
* - `if: expr`             → CSS display (conditional show/hide)
* - `value: expr`          → two-way binding for inputs
* - `checked: expr`        → two-way binding for checkboxes
* - `attr: { name: expr }` → element attributes
* - `css: { cls: expr }`   → CSS class toggle
* - `event: { ev: fn }`    → event listeners
* - `foreach: arrayExpr`   → repeat children for each item
*
* @example
* const state = reactive({ name: 'World', items: ['a', 'b'] });
* const stop = bind(state, '#app');
* state.name = 'Universe';  // DOM updates automatically
* // Later:
* stop();
*/
function bind(state, root) {
	if (typeof document === "undefined") return () => {};
	const rootEl = typeof root === "string" ? document.querySelector(root) : root;
	if (!rootEl) return () => {};
	return bindElement(rootEl, state);
}

//#endregion
//#region src/pages/capitals.html
var capitals_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\"><i class=\"bi bi-globe me-2\"></i>World Capitals</h1>\r\n  <p class=\"lead text-body-secondary\">Click a capital to see live weather and currency exchange rates.</p>\r\n  <p class=\"small text-muted\">\r\n    Demonstrates: <strong>MVVM</strong> reactive filter &middot; <strong>Storage</strong> currency cache &middot;\r\n    route params (<code>/examples/capitals/:id</code>) &middot; Open-Meteo &amp; Monobank APIs.\r\n  </p>\r\n  <div class=\"alert alert-info py-2 small\">\r\n    <i class=\"bi bi-info-circle me-1\"></i>\r\n    <strong>Exchange rates</strong> require a local proxy — run <code>npm start</code> to see live Monobank data.\r\n    On GitHub Pages the currency section shows a \"proxy required\" notice — that is expected.\r\n  </div>\r\n  <hr />\r\n  <div class=\"mb-3\">\r\n    <input\r\n      type=\"search\"\r\n      class=\"form-control\"\r\n      data-bind=\"value: query, event: { input: onFilter }\"\r\n      placeholder=\"Filter by capital or country...\"\r\n    />\r\n  </div>\r\n  <div class=\"table-responsive\">\r\n    <table class=\"table table-hover\">\r\n      <thead>\r\n        <tr>\r\n          <th>Capital</th>\r\n          <th>Country</th>\r\n          <th>Currency</th>\r\n          <th aria-label=\"Details\"></th>\r\n        </tr>\r\n      </thead>\r\n      <tbody id=\"capitals-tbody\" data-bind=\"foreach: items\">\r\n        <tr class=\"capital-row\" data-bind=\"attr: { 'data-id': id }\">\r\n          <td><strong data-bind=\"text: name\"></strong></td>\r\n          <td data-bind=\"text: country\"></td>\r\n          <td><span class=\"badge bg-info text-dark\" data-bind=\"text: currencyName\"></span></td>\r\n          <td class=\"text-end\"><i class=\"bi bi-chevron-right text-muted\"></i></td>\r\n        </tr>\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n  <p id=\"capitals-empty\" class=\"text-muted fst-italic d-none\">No capitals match your search.</p>\r\n</div>\r\n";

//#endregion
//#region src/pages/capitals.ts
function capitalsPage(container) {
	const router = inject(app, "router");
	container.innerHTML = capitals_default;
	bind(reactive({
		query: "",
		items: [...capitals],
		onFilter() {
			const q = this.query.toLowerCase().trim();
			this.items = q ? capitals.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) : [...capitals];
			$("#capitals-empty").toggleClass("d-none", this.items.length > 0);
		}
	}), container);
	$(container).on("click", ".capital-row", function() {
		navigate(router, `/examples/capitals/${$(this).data("id")}`);
	});
}

//#endregion
export { capitalsPage as default };