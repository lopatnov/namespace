//#region src/index.d.ts
/** Opaque namespace token. Internal structure is hidden from consumers. */
declare const _NS_BRAND: unique symbol;
type Namespace = {
  readonly [_NS_BRAND]: never;
};
type EventHandler = (...args: any[]) => void;
/**
 * Plugin contract for @lopatnov/namespace.
 * `TOptions = void` → install takes no options.
 */
interface NamespacePlugin<TOptions = void> {
  readonly id: string;
  install(ns: Namespace, options: TOptions): void;
  uninstall?(ns: Namespace): void;
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
/** List immediate entries (includes child namespaces). */
declare function entries(ns: Namespace): [string, unknown][];
/** Get or create a child namespace at `path`. Creates intermediates automatically. */
declare function scope(ns: Namespace, scopePath: string): Namespace;
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
/**
 * Merge data into a namespace.
 * Accepts a plain object OR another Namespace.
 * Unlike `toJSON`, this preserves functions.
 */
declare function extend(ns: Namespace, source: Record<string, unknown> | Namespace): void;
/** Serialize namespace tree to a plain object. Functions are skipped. */
declare function toJSON(ns: Namespace): Record<string, unknown>;
/** Restore namespace tree from a plain object. */
declare function fromJSON(data: Record<string, unknown>, parentNs?: Namespace, pathPrefix?: string): Namespace;
/** Deep clone a namespace tree (functions are not cloned). */
declare function clone(ns: Namespace): Namespace;
declare class App {
  #private;
  /** The underlying namespace. Use for library interop. */
  readonly ns: Namespace;
  constructor(ns: Namespace);
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
  on(event: string, handler: EventHandler): this;
  off(event: string, handler: EventHandler): this;
  emit(event: string, ...args: unknown[]): this;
  /** Subscribe once — handler is automatically removed after the first call. */
  once(event: string, handler: EventHandler): this;
  /** Get or create a child namespace. Returns an App wrapping it. */
  scope(scopePath: string): App;
  root(): App;
  parent(): App | null;
  has(key: string): boolean;
  remove(key: string): this;
  keys(): string[];
  /** Merge data from a plain object, another App, or a Namespace. */
  extend(source: Record<string, unknown> | App | Namespace): this;
  toJSON(): Record<string, unknown>;
  clone(): App;
  /** Check if a plugin is installed by plugin object or id string. */
  installed(plugin: NamespacePlugin<any> | string): boolean;
  /** Uninstall a plugin by plugin object or id string. */
  unuse(plugin: NamespacePlugin<any> | string): this;
}
/**
 * Create a new isolated application instance.
 *
 * Each call creates an independent namespace — apps never
 * interfere with each other. Ideal for microfrontend architectures.
 */
declare function createApp(): App;
//#endregion
export { App, EventHandler, Namespace, NamespacePlugin, clone, createApp, createNamespace, emit, entries, extend, fromJSON, has, inject, keys, off, on, parent, path, provide, remove, root, scope, toJSON };