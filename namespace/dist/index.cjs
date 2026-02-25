Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/index.ts
const _ns = /* @__PURE__ */ new WeakMap();
const _UNSET = Symbol("unset");
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
/** Register a value under a key. Supports dot-paths: `provide(ns, 'a.b.c', value)`. */
function provide(ns, key, value) {
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
function inject(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = getMeta(current).store.get(parts[i]);
		if (!isNamespace(child)) return void 0;
		current = child;
	}
	return getMeta(current).store.get(parts[parts.length - 1]);
}
/** Check if a key exists. Supports dot-paths. */
function has(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = getMeta(current).store.get(parts[i]);
		if (!isNamespace(child)) return false;
		current = child;
	}
	return getMeta(current).store.has(parts[parts.length - 1]);
}
/** Remove a key and its subtree. Returns `true` if the key existed. */
function remove(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = getMeta(current).store.get(parts[i]);
		if (!isNamespace(child)) return false;
		current = child;
	}
	const leaf = parts[parts.length - 1];
	const existed = getMeta(current).store.delete(leaf);
	if (existed) {
		const fullPath = buildPath(current, leaf);
		emitUp(current, "delete", fullPath);
	}
	return existed;
}
/** List immediate child keys. */
function keys(ns) {
	return Array.from(getMeta(ns).store.keys());
}
/** List immediate entries (includes child namespaces). */
function entries(ns) {
	return Array.from(getMeta(ns).store.entries());
}
/** Get or create a child namespace at `path`. Creates intermediates automatically. */
function scope(ns, scopePath) {
	const parts = parsePath(scopePath);
	let current = ns;
	for (const part of parts) current = ensureChild(current, part);
	return current;
}
/** Get the root namespace from any child. */
function root(ns) {
	let current = ns;
	while (getMeta(current).parent !== null) current = getMeta(current).parent;
	return current;
}
/** Get the parent namespace. Returns `null` for root. */
function parent(ns) {
	return getMeta(ns).parent;
}
/** Get the dot-path from root to this namespace. Empty string for root. */
function path(ns) {
	return getMeta(ns).path;
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
/** Unsubscribe a handler from an event. */
function off(ns, event, handler) {
	const meta = getMeta(ns);
	const handlers = meta.events.get(event);
	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) meta.events.delete(event);
	}
}
/** Emit an event with arguments. */
function emit(ns, event, ...args) {
	const handlers = getMeta(ns).events.get(event);
	if (handlers) for (const handler of handlers) handler(...args);
}
/**
* Merge data into a namespace.
* Accepts a plain object OR another Namespace.
* Unlike `toJSON`, this preserves functions.
*/
function extend(ns, source) {
	if (isNamespace(source)) for (const [k, v] of getMeta(source).store) if (isNamespace(v)) extend(ensureChild(ns, k), v);
	else provide(ns, k, v);
	else for (const [k, v] of Object.entries(source)) if (v !== null && typeof v === "object" && !Array.isArray(v)) extend(ensureChild(ns, k), v);
	else provide(ns, k, v);
}
/** Serialize namespace tree to a plain object. Functions are skipped. */
function toJSON(ns) {
	const result = {};
	for (const [key, value] of getMeta(ns).store) if (isNamespace(value)) result[key] = toJSON(value);
	else if (typeof value !== "function") result[key] = value;
	return result;
}
/** Restore namespace tree from a plain object. */
function fromJSON(data, parentNs, pathPrefix) {
	const ns = createNamespace();
	const meta = getMeta(ns);
	meta.parent = parentNs ?? null;
	meta.path = pathPrefix ?? "";
	for (const [key, value] of Object.entries(data)) if (value !== null && typeof value === "object" && !Array.isArray(value)) {
		const child = fromJSON(value, ns, meta.path ? `${meta.path}.${key}` : key);
		meta.store.set(key, child);
	} else meta.store.set(key, value);
	return ns;
}
/** Deep clone a namespace tree (functions are not cloned). */
function clone(ns) {
	return fromJSON(toJSON(ns));
}
var App = class App {
	/** The underlying namespace. Use for library interop. */
	ns;
	#plugins = /* @__PURE__ */ new Map();
	constructor(ns) {
		this.ns = ns;
	}
	use(keyOrPlugin, value = _UNSET) {
		if (typeof keyOrPlugin === "string") {
			if (value !== _UNSET) {
				provide(this.ns, keyOrPlugin, value);
				return this;
			}
			return inject(this.ns, keyOrPlugin);
		}
		if (!this.#plugins.has(keyOrPlugin.id)) {
			keyOrPlugin.install(this.ns, value === _UNSET ? void 0 : value);
			this.#plugins.set(keyOrPlugin.id, keyOrPlugin);
			emit(this.ns, "plugin:installed", keyOrPlugin.id);
		}
		return this;
	}
	on(event, handler) {
		on(this.ns, event, handler);
		return this;
	}
	off(event, handler) {
		off(this.ns, event, handler);
		return this;
	}
	emit(event, ...args) {
		emit(this.ns, event, ...args);
		return this;
	}
	/** Subscribe once — handler is automatically removed after the first call. */
	once(event, handler) {
		const unsub = on(this.ns, event, (...args) => {
			unsub();
			handler(...args);
		});
		return this;
	}
	/** Get or create a child namespace. Returns an App wrapping it. */
	scope(scopePath) {
		return new App(scope(this.ns, scopePath));
	}
	root() {
		return new App(root(this.ns));
	}
	parent() {
		const p = parent(this.ns);
		return p ? new App(p) : null;
	}
	has(key) {
		return has(this.ns, key);
	}
	remove(key) {
		remove(this.ns, key);
		return this;
	}
	keys() {
		return keys(this.ns);
	}
	/** Merge data from a plain object, another App, or a Namespace. */
	extend(source) {
		extend(this.ns, source instanceof App ? source.ns : source);
		return this;
	}
	toJSON() {
		return toJSON(this.ns);
	}
	clone() {
		return new App(clone(this.ns));
	}
	/** Check if a plugin is installed by plugin object or id string. */
	installed(plugin) {
		const id = typeof plugin === "string" ? plugin : plugin.id;
		return this.#plugins.has(id);
	}
	/** Uninstall a plugin by plugin object or id string. */
	unuse(plugin) {
		const id = typeof plugin === "string" ? plugin : plugin.id;
		const p = this.#plugins.get(id);
		if (p) {
			p.uninstall?.(this.ns);
			this.#plugins.delete(id);
			emit(this.ns, "plugin:uninstalled", id);
		}
		return this;
	}
};
/**
* Create a new isolated application instance.
*
* Each call creates an independent namespace — apps never
* interfere with each other. Ideal for microfrontend architectures.
*/
function createApp() {
	return new App(createNamespace());
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
exports.App = App;
exports.clone = clone;
exports.createApp = createApp;
exports.createNamespace = createNamespace;
exports.emit = emit;
exports.entries = entries;
exports.extend = extend;
exports.fromJSON = fromJSON;
exports.has = has;
exports.inject = inject;
exports.keys = keys;
exports.off = off;
exports.on = on;
exports.parent = parent;
exports.path = path;
exports.provide = provide;
exports.remove = remove;
exports.root = root;
exports.scope = scope;
exports.toJSON = toJSON;