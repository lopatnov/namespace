// ============================================================
// @lopatnov/namespace-storage — Persistent namespace storage
// Pure tree-shakeable functions. ES2024.
// ============================================================

import type { Namespace } from "@lopatnov/namespace";
import { extend, get, on, scope, set, toJSON } from "@lopatnov/namespace";

// --- Types ---

/** Storage adapter — sync (localStorage/sessionStorage) or async (IndexedDB wrapper). */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface PersistOptions {
  /** Namespace keys (dot-paths) to persist. */
  keys: string[];
  /** Storage backend. Accepts localStorage, sessionStorage, or a StorageAdapter. */
  storage: StorageAdapter;
  /** Debounce delay in ms before writing. Default: 0 (immediate). */
  debounce?: number;
  /** Key prefix in storage. Default: 'ns:'. */
  prefix?: string;
}

export interface RestoreOptions {
  /** Keys to restore. Each key is a dot-path into the namespace. */
  keys: string[];
  /** Storage backend. */
  storage: StorageAdapter;
  /** Key prefix in storage. Default: 'ns:'. */
  prefix?: string;
}

// --- Core ---

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
export function persist(ns: Namespace, options: PersistOptions): () => void {
  const { keys, storage, debounce: delay = 0, prefix = "ns:" } = options;

  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function findRootKey(changedKey: string): string | undefined {
    return keys.find((k) => changedKey === k || changedKey.startsWith(`${k}.`));
  }

  function save(changedKey: string): void {
    const rootKey = findRootKey(changedKey);
    if (!rootKey) return;

    const storageKey = `${prefix}${rootKey}`;

    const doSave = () => {
      const value = get(ns, rootKey);
      if (value === undefined) {
        storage.removeItem(storageKey);
      } else {
        let serialized: string;
        try {
          // Try to serialize as a namespace subtree first
          serialized = JSON.stringify(toJSON(value as Namespace));
        } catch {
          // Plain value (string, number, boolean, plain object, array)
          serialized = JSON.stringify(value);
        }
        storage.setItem(storageKey, serialized);
      }
    };

    if (delay > 0) {
      const existing = timers.get(rootKey);
      if (existing !== undefined) clearTimeout(existing);
      timers.set(rootKey, setTimeout(doSave, delay));
    } else {
      doSave();
    }
  }

  const unsubChange = on(ns, "change", (key: unknown) => save(key as string));
  const unsubDelete = on(ns, "delete", (key: unknown) => save(key as string));

  return () => {
    unsubChange();
    unsubDelete();
    for (const t of timers.values()) clearTimeout(t);
    timers.clear();
  };
}

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
export async function restore(ns: Namespace, options: RestoreOptions): Promise<void> {
  const { keys, storage, prefix = "ns:" } = options;

  for (const key of keys) {
    const raw = await storage.getItem(`${prefix}${key}`);
    if (raw === null) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        // Namespace-style data — extend into a scoped namespace
        extend(scope(ns, key), parsed as Record<string, unknown>);
      } else {
        set(ns, key, parsed);
      }
    } catch {
      // Ignore JSON parse errors (corrupted data)
    }
  }
}

/**
 * Create an IndexedDB-backed StorageAdapter.
 * Falls back to an in-memory Map if IndexedDB is unavailable (e.g. Node.js).
 *
 * @example
 * const idb = createIndexedDB('my-app');
 * persist(app.ns, { keys: ['user'], storage: idb });
 * await restore(app.ns, { keys: ['user'], storage: idb });
 */
export function createIndexedDB(dbName: string, storeName = "ns-storage"): StorageAdapter {
  let db: IDBDatabase | null = null;
  const memFallback = new Map<string, string>();

  const dbReady: Promise<IDBDatabase | null> =
    typeof indexedDB === "undefined"
      ? Promise.resolve(null)
      : new Promise((resolve) => {
          const req = indexedDB.open(dbName, 1);
          req.onupgradeneeded = () => {
            req.result.createObjectStore(storeName);
          };
          req.onsuccess = () => {
            db = req.result;
            resolve(db);
          };
          req.onerror = () => resolve(null);
        });

  function txStore(mode: IDBTransactionMode): IDBObjectStore {
    return db!.transaction(storeName, mode).objectStore(storeName);
  }

  return {
    async getItem(key: string): Promise<string | null> {
      await dbReady;
      if (!db) return memFallback.get(key) ?? null;
      return new Promise((resolve) => {
        const req = txStore("readonly").get(key);
        req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
        req.onerror = () => resolve(null);
      });
    },

    async setItem(key: string, value: string): Promise<void> {
      await dbReady;
      if (!db) {
        memFallback.set(key, value);
        return;
      }
      return new Promise((resolve) => {
        const req = txStore("readwrite").put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    },

    async removeItem(key: string): Promise<void> {
      await dbReady;
      if (!db) {
        memFallback.delete(key);
        return;
      }
      return new Promise((resolve) => {
        const req = txStore("readwrite").delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    },
  };
}
