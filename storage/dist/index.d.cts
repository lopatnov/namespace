import { Namespace } from "@lopatnov/namespace";

//#region src/index.d.ts
/** Storage adapter — sync (localStorage/sessionStorage) or async (IndexedDB wrapper). */
interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
interface PersistOptions {
  /** Namespace keys (dot-paths) to persist. */
  keys: string[];
  /** Storage backend. Accepts localStorage, sessionStorage, or a StorageAdapter. */
  storage: StorageAdapter;
  /** Debounce delay in ms before writing. Default: 0 (immediate). */
  debounce?: number;
  /** Key prefix in storage. Default: 'ns:'. */
  prefix?: string;
}
interface RestoreOptions {
  /** Keys to restore. Each key is a dot-path into the namespace. */
  keys: string[];
  /** Storage backend. */
  storage: StorageAdapter;
  /** Key prefix in storage. Default: 'ns:'. */
  prefix?: string;
}
/**
 * Subscribe to namespace changes and persist specified keys to storage.
 * Returns a cleanup function that stops persisting.
 *
 * @example
 * const stop = persist(app.ns, {
 *   keys: ['user', 'settings'],
 *   storage: localStorage,
 *   debounce: 300,
 * });
 * // Later: stop();
 */
declare function persist(ns: Namespace, options: PersistOptions): () => void;
/**
 * Restore namespace keys from storage.
 * Returns a Promise that resolves when all keys have been loaded.
 *
 * @example
 * await restore(app.ns, {
 *   keys: ['user', 'settings'],
 *   storage: localStorage,
 * });
 */
declare function restore(ns: Namespace, options: RestoreOptions): Promise<void>;
/**
 * Create an IndexedDB-backed StorageAdapter.
 * Falls back to an in-memory Map if IndexedDB is unavailable (e.g. Node.js).
 *
 * @example
 * const idb = createIndexedDB('my-app');
 * persist(app.ns, { keys: ['user'], storage: idb });
 * await restore(app.ns, { keys: ['user'], storage: idb });
 */
declare function createIndexedDB(dbName: string, storeName?: string): StorageAdapter;
//#endregion
export { PersistOptions, RestoreOptions, StorageAdapter, createIndexedDB, persist, restore };