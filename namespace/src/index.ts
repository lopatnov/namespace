// ============================================================
// @lopatnov/namespace — Core kernel
// Pure tree-shakeable functions. ES2024.
// ============================================================

// --- Symbols (internal storage, invisible to consumers) ---

const STORE = Symbol("ns.store");
const EVENTS = Symbol("ns.events");
const PARENT = Symbol("ns.parent");
const PATH = Symbol("ns.path");

// --- Types ---

export type EventHandler = (...args: any[]) => void;

export interface Namespace {
  [STORE]: Map<string, unknown>;
  [EVENTS]: Map<string, Set<EventHandler>>;
  [PARENT]: Namespace | null;
  [PATH]: string;
}

// --- Core ---

/** Create a new root namespace. */
export function createNamespace(): Namespace {
  return {
    [STORE]: new Map(),
    [EVENTS]: new Map(),
    [PARENT]: null,
    [PATH]: "",
  };
}

// --- Service registry ---

/** Register a value under a key. Supports dot-paths: `provide(ns, 'a.b.c', value)`. */
export function provide<T>(ns: Namespace, key: string, value: T): void {
  const parts = parsePath(key);

  if (parts.length === 1) {
    const old = ns[STORE].get(parts[0]);
    ns[STORE].set(parts[0], value);
    emit(ns, "change", key, value, old);
    return;
  }

  // Navigate / create intermediate scopes
  let current = ns;
  for (let i = 0; i < parts.length - 1; i++) {
    current = ensureChild(current, parts[i]);
  }
  const leaf = parts[parts.length - 1];
  const old = current[STORE].get(leaf);
  current[STORE].set(leaf, value);

  const fullPath = buildPath(current, leaf);
  emitUp(ns, current, "change", fullPath, value, old);
}

/** Retrieve a value by key. Returns `undefined` if not found. */
export function inject<T = unknown>(ns: Namespace, key: string): T | undefined {
  const parts = parsePath(key);
  let current: Namespace = ns;

  for (let i = 0; i < parts.length - 1; i++) {
    const child = current[STORE].get(parts[i]);
    if (!isNamespace(child)) return undefined;
    current = child;
  }

  return current[STORE].get(parts[parts.length - 1]) as T | undefined;
}

/** Check if a key exists. Supports dot-paths. */
export function has(ns: Namespace, key: string): boolean {
  const parts = parsePath(key);
  let current: Namespace = ns;

  for (let i = 0; i < parts.length - 1; i++) {
    const child = current[STORE].get(parts[i]);
    if (!isNamespace(child)) return false;
    current = child;
  }

  return current[STORE].has(parts[parts.length - 1]);
}

/** Remove a key and its subtree. Returns `true` if the key existed. */
export function remove(ns: Namespace, key: string): boolean {
  const parts = parsePath(key);
  let current: Namespace = ns;

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
export function keys(ns: Namespace): string[] {
  return Array.from(ns[STORE].keys());
}

/** List immediate entries. */
export function entries(ns: Namespace): [string, unknown][] {
  return Array.from(ns[STORE].entries());
}

// --- Scoping ---

/** Get or create a child namespace at `path`. Creates intermediates automatically. */
export function scope(ns: Namespace, path: string): Namespace {
  const parts = parsePath(path);
  let current = ns;

  for (const part of parts) {
    current = ensureChild(current, part);
  }

  return current;
}

/** Get the root namespace from any child. */
export function root(ns: Namespace): Namespace {
  let current = ns;
  while (current[PARENT] !== null) {
    current = current[PARENT];
  }
  return current;
}

/** Get the parent namespace. Returns `null` for root. */
export function parent(ns: Namespace): Namespace | null {
  return ns[PARENT];
}

/** Get the dot-path from root to this namespace. Empty string for root. */
export function path(ns: Namespace): string {
  return ns[PATH];
}

// --- Event bus ---

/** Subscribe to an event. Returns an unsubscribe function. */
export function on(ns: Namespace, event: string, handler: EventHandler): () => void {
  let handlers = ns[EVENTS].get(event);
  if (!handlers) {
    handlers = new Set();
    ns[EVENTS].set(event, handlers);
  }
  handlers.add(handler);

  return () => {
    handlers!.delete(handler);
    if (handlers!.size === 0) {
      ns[EVENTS].delete(event);
    }
  };
}

/** Unsubscribe a handler from an event. */
export function off(ns: Namespace, event: string, handler: EventHandler): void {
  const handlers = ns[EVENTS].get(event);
  if (handlers) {
    handlers.delete(handler);
    if (handlers.size === 0) {
      ns[EVENTS].delete(event);
    }
  }
}

/** Emit an event with arguments. */
export function emit(ns: Namespace, event: string, ...args: unknown[]): void {
  const handlers = ns[EVENTS].get(event);
  if (handlers) {
    for (const handler of handlers) {
      handler(...args);
    }
  }
}

// --- Serialization ---

/** Serialize namespace tree to a plain object. Functions are skipped. */
export function toJSON(ns: Namespace): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of ns[STORE]) {
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
  ns[PARENT] = parentNs ?? null;
  ns[PATH] = pathPrefix ?? "";

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const childPath = ns[PATH] ? `${ns[PATH]}.${key}` : key;
      const child = fromJSON(value as Record<string, unknown>, ns, childPath);
      ns[STORE].set(key, child);
    } else {
      ns[STORE].set(key, value);
    }
  }

  return ns;
}

/** Deep clone a namespace tree. */
export function clone(ns: Namespace): Namespace {
  return fromJSON(toJSON(ns));
}

/** Merge a plain object into a namespace (shallow at each level). */
export function merge(ns: Namespace, data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const child = ensureChild(ns, key);
      merge(child, value as Record<string, unknown>);
    } else {
      provide(ns, key, value);
    }
  }
}

// --- Internal helpers ---

function parsePath(key: string): string[] {
  const parts = key.split(".");
  if (parts.length === 0 || parts.some((p) => p === "")) {
    throw new Error(`Invalid namespace path: "${key}"`);
  }
  return parts;
}

function isNamespace(value: unknown): value is Namespace {
  return value !== null && typeof value === "object" && STORE in (value as object);
}

function ensureChild(ns: Namespace, key: string): Namespace {
  const existing = ns[STORE].get(key);
  if (isNamespace(existing)) {
    return existing;
  }

  const child: Namespace = {
    [STORE]: new Map(),
    [EVENTS]: new Map(),
    [PARENT]: ns,
    [PATH]: ns[PATH] ? `${ns[PATH]}.${key}` : key,
  };
  ns[STORE].set(key, child);
  return child;
}

function buildPath(ns: Namespace, leaf: string): string {
  return ns[PATH] ? `${ns[PATH]}.${leaf}` : leaf;
}

function emitUp(rootNs: Namespace, currentNs: Namespace, event: string, ...args: unknown[]): void {
  // Emit on the node where the change happened
  emit(currentNs, event, ...args);

  // Bubble up to root
  let cursor = currentNs[PARENT];
  while (cursor !== null) {
    emit(cursor, event, ...args);
    cursor = cursor[PARENT];
  }
}
