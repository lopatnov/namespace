# @lopatnov/namespace-storage

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-storage)](https://www.npmjs.com/package/@lopatnov/namespace-storage)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-storage)](LICENSE)

Persistent storage for `@lopatnov/namespace`. Auto-sync namespace keys to `localStorage`, `sessionStorage`, or `IndexedDB` with optional debounce.

## Install

```sh
npm install @lopatnov/namespace @lopatnov/namespace-storage
```

## Quick start

```ts
import { createNamespace, set } from '@lopatnov/namespace';
import { persist, restore } from '@lopatnov/namespace-storage';

const ns = createNamespace();

// Restore saved state on startup
await restore(ns, { keys: ['user', 'settings'], storage: localStorage });

// Auto-save on every change (debounced 300 ms)
const stop = persist(ns, {
  keys: ['user', 'settings'],
  storage: localStorage,
  debounce: 300,
});

set(ns, 'user', { name: 'Alice' }); // written to localStorage automatically

// Stop persisting when no longer needed
stop();
```

## IndexedDB

```ts
import { createIndexedDB, persist, restore } from '@lopatnov/namespace-storage';

const idb = createIndexedDB('myApp', 'ns-store');
await restore(ns, { keys: ['cache'], storage: idb });
persist(ns, { keys: ['cache'], storage: idb });
```

## API

| Function | Description |
|----------|-------------|
| `persist(ns, options)` | Subscribe to namespace changes and write keys to storage. Returns `stop()` |
| `restore(ns, options)` | Read keys from storage and load them into the namespace |
| `createIndexedDB(dbName, storeName?)` | Create an IndexedDB-backed `StorageAdapter` |

### PersistOptions

```ts
interface PersistOptions {
  keys: string[];           // dot-path keys to watch
  storage: StorageAdapter;  // localStorage / sessionStorage / custom
  debounce?: number;        // ms before writing (default: 0)
  prefix?: string;          // storage key prefix (default: 'ns:')
}
```

### StorageAdapter interface

Any object that satisfies:

```ts
interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
```

`localStorage` and `sessionStorage` satisfy this interface natively.

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
