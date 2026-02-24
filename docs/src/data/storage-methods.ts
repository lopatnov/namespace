import type { MethodGroup } from "./namespace-methods.ts";

export const storageMethods: MethodGroup[] = [
  {
    slug: "persist",
    title: "persist / restore",
    methods: [
      {
        name: "persist",
        signature: "persist(ns: Namespace, options: PersistOptions): () => void",
        description:
          "Subscribe to namespace changes and automatically save specified keys to storage. Returns a cleanup function. Options: `keys` (dot-paths to watch), `storage` (localStorage, sessionStorage, or StorageAdapter), `debounce` (ms, default 0), `prefix` (default 'ns:').",
        example: `import { persist } from '@lopatnov/namespace-storage';

const stop = persist(app.ns, {
  keys: ['user', 'settings'],
  storage: localStorage,
  debounce: 300,
});

// Automatically saved on every change:
set(app.ns, 'user.name', 'Alice');

// Stop persisting:
stop();`,
      },
      {
        name: "restore",
        signature: "restore(ns: Namespace, options: RestoreOptions): Promise<void>",
        description:
          "Restore namespace keys from storage. Call this once on app startup. Returns a Promise that resolves when all keys have been loaded. Missing keys are silently skipped. Corrupted JSON is ignored.",
        example: `import { persist, restore } from '@lopatnov/namespace-storage';

// On startup — restore saved state
await restore(app.ns, {
  keys: ['user', 'settings'],
  storage: localStorage,
});

// Then start persisting future changes
persist(app.ns, {
  keys: ['user', 'settings'],
  storage: localStorage,
  debounce: 300,
});`,
      },
    ],
  },
  {
    slug: "createIndexedDB",
    title: "createIndexedDB",
    methods: [
      {
        name: "createIndexedDB",
        signature: "createIndexedDB(dbName: string, storeName?: string): StorageAdapter",
        description:
          "Create an IndexedDB-backed StorageAdapter. The adapter is async — getItem/setItem/removeItem return Promises. Falls back to an in-memory Map when IndexedDB is unavailable (e.g. Node.js, old browsers). The database is opened lazily on first use.",
        example: `import { createIndexedDB, persist, restore } from '@lopatnov/namespace-storage';

const idb = createIndexedDB('my-app');

await restore(app.ns, {
  keys: ['cache', 'preferences'],
  storage: idb,
});

persist(app.ns, {
  keys: ['cache', 'preferences'],
  storage: idb,
  debounce: 500,
});`,
      },
    ],
  },
];
