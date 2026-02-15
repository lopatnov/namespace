//#region src/index.d.ts
declare const STORE: unique symbol;
declare const EVENTS: unique symbol;
declare const PARENT: unique symbol;
declare const PATH: unique symbol;
type EventHandler = (...args: any[]) => void;
interface Namespace {
  [STORE]: Map<string, unknown>;
  [EVENTS]: Map<string, Set<EventHandler>>;
  [PARENT]: Namespace | null;
  [PATH]: string;
}
/** Create a new root namespace. */
declare function createNamespace(): Namespace;
/** Register a value under a key. Supports dot-paths: `provide(ns, 'a.b.c', value)`. */
declare function provide<T>(ns: Namespace, key: string, value: T): void;
/** Retrieve a value by key. Returns `undefined` if not found. */
declare function inject<T = unknown>(ns: Namespace, key: string): T | undefined;
/** Check if a key exists. Supports dot-paths. */
declare function has(ns: Namespace, key: string): boolean;
/** Remove a key and its subtree. Returns `true` if the key existed. */
declare function remove(ns: Namespace, key: string): boolean;
/** List immediate child keys. */
declare function keys(ns: Namespace): string[];
/** List immediate entries. */
declare function entries(ns: Namespace): [string, unknown][];
/** Get or create a child namespace at `path`. Creates intermediates automatically. */
declare function scope(ns: Namespace, path: string): Namespace;
/** Get the root namespace from any child. */
declare function root(ns: Namespace): Namespace;
/** Get the parent namespace. Returns `null` for root. */
declare function parent(ns: Namespace): Namespace | null;
/** Get the dot-path from root to this namespace. Empty string for root. */
declare function path(ns: Namespace): string;
/** Subscribe to an event. Returns an unsubscribe function. */
declare function on(ns: Namespace, event: string, handler: EventHandler): () => void;
/** Unsubscribe a handler from an event. */
declare function off(ns: Namespace, event: string, handler: EventHandler): void;
/** Emit an event with arguments. */
declare function emit(ns: Namespace, event: string, ...args: unknown[]): void;
/** Serialize namespace tree to a plain object. Functions are skipped. */
declare function toJSON(ns: Namespace): Record<string, unknown>;
/** Restore namespace tree from a plain object. */
declare function fromJSON(data: Record<string, unknown>, parentNs?: Namespace, pathPrefix?: string): Namespace;
/** Deep clone a namespace tree. */
declare function clone(ns: Namespace): Namespace;
/** Merge a plain object into a namespace (shallow at each level). */
declare function merge(ns: Namespace, data: Record<string, unknown>): void;
//#endregion
export { EventHandler, Namespace, clone, createNamespace, emit, entries, fromJSON, has, inject, keys, merge, off, on, parent, path, provide, remove, root, scope, toJSON };