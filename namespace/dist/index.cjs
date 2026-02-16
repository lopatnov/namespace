Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/index.ts
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
/** Check if a key exists. Supports dot-paths. */
function has(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = current[STORE].get(parts[i]);
		if (!isNamespace(child)) return false;
		current = child;
	}
	return current[STORE].has(parts[parts.length - 1]);
}
/** Remove a key and its subtree. Returns `true` if the key existed. */
function remove(ns, key) {
	const parts = parsePath(key);
	let current = ns;
	for (let i = 0; i < parts.length - 1; i++) {
		const child = current[STORE].get(parts[i]);
		if (!isNamespace(child)) return false;
		current = child;
	}
	const leaf = parts[parts.length - 1];
	const existed = current[STORE].delete(leaf);
	if (existed) {
		const fullPath = buildPath(current, leaf);
		emitUp(ns, current, "delete", fullPath);
	}
	return existed;
}
/** List immediate child keys. */
function keys(ns) {
	return Array.from(ns[STORE].keys());
}
/** List immediate entries. */
function entries(ns) {
	return Array.from(ns[STORE].entries());
}
/** Get or create a child namespace at `path`. Creates intermediates automatically. */
function scope(ns, path) {
	const parts = parsePath(path);
	let current = ns;
	for (const part of parts) current = ensureChild(current, part);
	return current;
}
/** Get the root namespace from any child. */
function root(ns) {
	let current = ns;
	while (current[PARENT] !== null) current = current[PARENT];
	return current;
}
/** Get the parent namespace. Returns `null` for root. */
function parent(ns) {
	return ns[PARENT];
}
/** Get the dot-path from root to this namespace. Empty string for root. */
function path(ns) {
	return ns[PATH];
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
/** Unsubscribe a handler from an event. */
function off(ns, event, handler) {
	const handlers = ns[EVENTS].get(event);
	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) ns[EVENTS].delete(event);
	}
}
/** Emit an event with arguments. */
function emit(ns, event, ...args) {
	const handlers = ns[EVENTS].get(event);
	if (handlers) for (const handler of handlers) handler(...args);
}
/** Serialize namespace tree to a plain object. Functions are skipped. */
function toJSON(ns) {
	const result = {};
	for (const [key, value] of ns[STORE]) if (isNamespace(value)) result[key] = toJSON(value);
	else if (typeof value !== "function") result[key] = value;
	return result;
}
/** Restore namespace tree from a plain object. */
function fromJSON(data, parentNs, pathPrefix) {
	const ns = createNamespace();
	ns[PARENT] = parentNs ?? null;
	ns[PATH] = pathPrefix ?? "";
	for (const [key, value] of Object.entries(data)) if (value !== null && typeof value === "object" && !Array.isArray(value)) {
		const child = fromJSON(value, ns, ns[PATH] ? `${ns[PATH]}.${key}` : key);
		ns[STORE].set(key, child);
	} else ns[STORE].set(key, value);
	return ns;
}
/** Deep clone a namespace tree. */
function clone(ns) {
	return fromJSON(toJSON(ns));
}
/** Merge a plain object into a namespace (shallow at each level). */
function merge(ns, data) {
	for (const [key, value] of Object.entries(data)) if (value !== null && typeof value === "object" && !Array.isArray(value)) merge(ensureChild(ns, key), value);
	else provide(ns, key, value);
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
exports.clone = clone;
exports.createNamespace = createNamespace;
exports.emit = emit;
exports.entries = entries;
exports.fromJSON = fromJSON;
exports.has = has;
exports.inject = inject;
exports.keys = keys;
exports.merge = merge;
exports.off = off;
exports.on = on;
exports.parent = parent;
exports.path = path;
exports.provide = provide;
exports.remove = remove;
exports.root = root;
exports.scope = scope;
exports.toJSON = toJSON;