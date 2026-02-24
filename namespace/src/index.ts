// ============================================================
// @lopatnov/namespace v3 — Core kernel
// Pure tree-shakeable functions + createApp() for apps.
// WeakMap internals — opaque Namespace token.
// Each createApp() instance is fully isolated (microfrontend-ready).
// ES2024.
// ============================================================

// --- Internal storage via WeakMap (not exposed to consumers) ---

interface NsMeta {
  store: Map<string, unknown>;
  events: Map<string, Set<EventHandler>>;
  parent: Namespace | null;
  path: string;
}

const _ns = new WeakMap<Namespace, NsMeta>();

// Sentinel distinguishing App.use(key) [get] from App.use(key, value) [set]
const _UNSET = Symbol("unset");

// --- Public types ---

/** Opaque namespace token. Internal structure is hidden from consumers. */
declare const _NS_BRAND: unique symbol;
export type Namespace = { readonly [_NS_BRAND]: never };

export type EventHandler = (...args: any[]) => void;

/**
 * Plugin contract for @lopatnov/namespace.
 * `TOptions = void` → install takes no options.
 */
export interface NamespacePlugin<TOptions = void> {
  readonly id: string;
  install(ns: Namespace, options: TOptions): void;
  uninstall?(ns: Namespace): void;
}

// --- Core ---

/** Create a new root namespace. */
export function createNamespace(): Namespace {
  const ns = Object.create(null) as Namespace;
  _ns.set(ns, {
    store: new Map(),
    events: new Map(),
    parent: null,
    path: "",
  });
  return ns;
}

// --- Service registry ---

/** Register a value under a key. Supports dot-paths: `set(ns, 'a.b.c', value)`. */
export function set<T>(ns: Namespace, key: string, value: T): void {
  const parts = parsePath(key);
  const meta = getMeta(ns);

  if (parts.length === 1) {
    const old = meta.store.get(parts[0]);
    meta.store.set(parts[0], value);
    emit(ns, "change", key, value, old);
    return;
  }

  let current = ns;
  for (let i = 0; i < parts.length - 1; i++) {
    current = ensureChild(current, parts[i]);
  }
  const leaf = parts[parts.length - 1];
  const currentMeta = getMeta(current);
  const old = currentMeta.store.get(leaf);
  currentMeta.store.set(leaf, value);

  const fullPath = buildPath(current, leaf);
  emitUp(current, "change", fullPath, value, old);
}

/** Retrieve a value by key. Returns `undefined` if not found. */
export function get<T = unknown>(ns: Namespace, key: string): T | undefined {
  const parts = parsePath(key);
  let current: Namespace = ns;

  for (let i = 0; i < parts.length - 1; i++) {
    const child = getMeta(current).store.get(parts[i]);
    if (!isNamespace(child)) return undefined;
    current = child;
  }

  return getMeta(current).store.get(parts[parts.length - 1]) as T | undefined;
}

/** Check if a key exists. Supports dot-paths. */
export function has(ns: Namespace, key: string): boolean {
  const parts = parsePath(key);
  let current: Namespace = ns;

  for (let i = 0; i < parts.length - 1; i++) {
    const child = getMeta(current).store.get(parts[i]);
    if (!isNamespace(child)) return false;
    current = child;
  }

  return getMeta(current).store.has(parts[parts.length - 1]);
}

/** Remove a key and its subtree. Returns `true` if the key existed. */
export function remove(ns: Namespace, key: string): boolean {
  const parts = parsePath(key);
  let current: Namespace = ns;

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
export function keys(ns: Namespace): string[] {
  return Array.from(getMeta(ns).store.keys());
}

/** List immediate entries (includes child namespaces). */
export function entries(ns: Namespace): [string, unknown][] {
  return Array.from(getMeta(ns).store.entries());
}

// --- Scoping ---

/** Get or create a child namespace at `path`. Creates intermediates automatically. */
export function scope(ns: Namespace, scopePath: string): Namespace {
  const parts = parsePath(scopePath);
  let current = ns;
  for (const part of parts) {
    current = ensureChild(current, part);
  }
  return current;
}

/** Get the root namespace from any child. */
export function root(ns: Namespace): Namespace {
  let current = ns;
  while (getMeta(current).parent !== null) {
    current = getMeta(current).parent!;
  }
  return current;
}

/** Get the parent namespace. Returns `null` for root. */
export function parent(ns: Namespace): Namespace | null {
  return getMeta(ns).parent;
}

/** Get the dot-path from root to this namespace. Empty string for root. */
export function path(ns: Namespace): string {
  return getMeta(ns).path;
}

// --- Event bus ---

/** Subscribe to an event. Returns an unsubscribe function. */
export function on(ns: Namespace, event: string, handler: EventHandler): () => void {
  const meta = getMeta(ns);
  let handlers = meta.events.get(event);
  if (!handlers) {
    handlers = new Set();
    meta.events.set(event, handlers);
  }
  handlers.add(handler);

  return () => {
    handlers!.delete(handler);
    if (handlers!.size === 0) meta.events.delete(event);
  };
}

/** Unsubscribe a handler from an event. */
export function off(ns: Namespace, event: string, handler: EventHandler): void {
  const meta = getMeta(ns);
  const handlers = meta.events.get(event);
  if (handlers) {
    handlers.delete(handler);
    if (handlers.size === 0) meta.events.delete(event);
  }
}

/** Emit an event with arguments. */
export function emit(ns: Namespace, event: string, ...args: unknown[]): void {
  const handlers = getMeta(ns).events.get(event);
  if (handlers) {
    for (const handler of handlers) handler(...args);
  }
}

// --- Extend (enhanced merge) ---

/**
 * Merge data into a namespace.
 * Accepts a plain object OR another Namespace.
 * Unlike `toJSON`, this preserves functions.
 */
export function extend(ns: Namespace, source: Record<string, unknown> | Namespace): void {
  if (isNamespace(source)) {
    for (const [k, v] of getMeta(source).store) {
      if (isNamespace(v)) {
        extend(ensureChild(ns, k), v);
      } else {
        set(ns, k, v);
      }
    }
  } else {
    for (const [k, v] of Object.entries(source)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        extend(ensureChild(ns, k), v as Record<string, unknown>);
      } else {
        set(ns, k, v);
      }
    }
  }
}

// --- Serialization ---

/** Serialize namespace tree to a plain object. Functions are skipped. */
export function toJSON(ns: Namespace): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of getMeta(ns).store) {
    if (isNamespace(value)) {
      result[key] = toJSON(value);
    } else if (typeof value !== "function") {
      result[key] = value;
    }
  }
  return result;
}

/** Restore namespace tree from a plain object. */
export function fromJSON(
  data: Record<string, unknown>,
  parentNs?: Namespace,
  pathPrefix?: string,
): Namespace {
  const ns = createNamespace();
  const meta = getMeta(ns);
  meta.parent = parentNs ?? null;
  meta.path = pathPrefix ?? "";

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const childPath = meta.path ? `${meta.path}.${key}` : key;
      const child = fromJSON(value as Record<string, unknown>, ns, childPath);
      meta.store.set(key, child);
    } else {
      meta.store.set(key, value);
    }
  }

  return ns;
}

/** Deep clone a namespace tree (functions are not cloned). */
export function clone(ns: Namespace): Namespace {
  return fromJSON(toJSON(ns));
}

// ============================================================
// createApp() — Fluent API for application developers
//
// Each app owns an independent namespace. Multiple apps never
// share state — making this architecture naturally suitable
// for microfrontends running on the same page.
//
//   const shell  = createApp();   // host app
//   const widget = createApp();   // micro-app, fully isolated
//
// ============================================================

export class App {
  /** The underlying namespace. Use for library interop. */
  readonly ns: Namespace;
  readonly #plugins = new Map<string, NamespacePlugin<any>>();

  constructor(ns: Namespace) {
    this.ns = ns;
  }

  /**
   * Unified access method:
   *   app.use('key')           → get value
   *   app.use('key', value)    → set value, returns this
   *   app.use(Plugin)          → install plugin, returns this
   *   app.use(Plugin, options) → install plugin with options, returns this
   */
  use<T = unknown>(key: string): T | undefined;
  use(key: string, value: unknown): this;
  use(plugin: NamespacePlugin<void>): this;
  use<TOptions>(plugin: NamespacePlugin<TOptions>, opts: TOptions): this;
  use(keyOrPlugin: string | NamespacePlugin<any>, value: unknown = _UNSET): unknown {
    if (typeof keyOrPlugin === "string") {
      if (value !== _UNSET) {
        set(this.ns, keyOrPlugin, value);
        return this;
      }
      return get(this.ns, keyOrPlugin);
    }
    // Plugin — idempotent install
    if (!this.#plugins.has(keyOrPlugin.id)) {
      keyOrPlugin.install(this.ns, value === _UNSET ? undefined : value);
      this.#plugins.set(keyOrPlugin.id, keyOrPlugin);
      emit(this.ns, "plugin:installed", keyOrPlugin.id);
    }
    return this;
  }

  on(event: string, handler: EventHandler): this {
    on(this.ns, event, handler);
    return this;
  }

  off(event: string, handler: EventHandler): this {
    off(this.ns, event, handler);
    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    emit(this.ns, event, ...args);
    return this;
  }

  /** Subscribe once — handler is automatically removed after the first call. */
  once(event: string, handler: EventHandler): this {
    const unsub = on(this.ns, event, (...args) => {
      unsub();
      handler(...args);
    });
    return this;
  }

  /** Get or create a child namespace. Returns an App wrapping it. */
  scope(scopePath: string): App {
    return new App(scope(this.ns, scopePath));
  }

  root(): App {
    return new App(root(this.ns));
  }

  parent(): App | null {
    const p = parent(this.ns);
    return p ? new App(p) : null;
  }

  has(key: string): boolean {
    return has(this.ns, key);
  }

  remove(key: string): this {
    remove(this.ns, key);
    return this;
  }

  keys(): string[] {
    return keys(this.ns);
  }

  /** Merge data from a plain object, another App, or a Namespace. */
  extend(source: Record<string, unknown> | App | Namespace): this {
    extend(this.ns, source instanceof App ? source.ns : source);
    return this;
  }

  toJSON(): Record<string, unknown> {
    return toJSON(this.ns);
  }

  clone(): App {
    return new App(clone(this.ns));
  }

  /** Check if a plugin is installed by plugin object or id string. */
  installed(plugin: NamespacePlugin<any> | string): boolean {
    const id = typeof plugin === "string" ? plugin : plugin.id;
    return this.#plugins.has(id);
  }

  /** Uninstall a plugin by plugin object or id string. */
  unuse(plugin: NamespacePlugin<any> | string): this {
    const id = typeof plugin === "string" ? plugin : plugin.id;
    const p = this.#plugins.get(id);
    if (p) {
      p.uninstall?.(this.ns);
      this.#plugins.delete(id);
      emit(this.ns, "plugin:uninstalled", id);
    }
    return this;
  }
}

/**
 * Create a new isolated application instance.
 *
 * Each call creates an independent namespace — apps never
 * interfere with each other. Ideal for microfrontend architectures.
 */
export function createApp(): App {
  return new App(createNamespace());
}

// --- Internal helpers ---

function getMeta(ns: Namespace): NsMeta {
  const meta = _ns.get(ns);
  if (!meta) throw new Error("Invalid namespace object");
  return meta;
}

function parsePath(key: string): string[] {
  const parts = key.split(".");
  if (parts.length === 0 || parts.some((p) => p === "")) {
    throw new Error(`Invalid namespace path: "${key}"`);
  }
  return parts;
}

function isNamespace(value: unknown): value is Namespace {
  return value !== null && typeof value === "object" && _ns.has(value as Namespace);
}

function ensureChild(ns: Namespace, key: string): Namespace {
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

function buildPath(ns: Namespace, leaf: string): string {
  const p = getMeta(ns).path;
  return p ? `${p}.${leaf}` : leaf;
}

function emitUp(currentNs: Namespace, event: string, ...args: unknown[]): void {
  emit(currentNs, event, ...args);
  let cursor = getMeta(currentNs).parent;
  while (cursor !== null) {
    emit(cursor, event, ...args);
    cursor = getMeta(cursor).parent;
  }
}
