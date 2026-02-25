# @lopatnov/namespace

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace)](LICENSE)

Service registry, event bus, dependency injection, and scoped namespaces.
Foundation for the `@lopatnov` ecosystem — works standalone or with any of the companion packages.

## Install

```sh
npm install @lopatnov/namespace
```

## Quick start

```ts
import { createNamespace, set, get, on } from '@lopatnov/namespace';

const ns = createNamespace();

set(ns, 'config.apiUrl', '/api/v1');
get<string>(ns, 'config.apiUrl'); // '/api/v1'

on(ns, 'change', (key, next, prev) => console.log(key, prev, '→', next));
```

### App API (fluent)

```ts
import { createApp } from '@lopatnov/namespace';

const app = createApp()
  .use('config', { apiUrl: '/api/v1' })
  .use(RouterPlugin, { mode: 'hash' })
  .on('error', console.error);

const config = app.use<Config>('config'); // get
```

## API

### Service registry

| Function | Description |
|----------|-------------|
| `createNamespace()` | Create a new root namespace |
| `set(ns, key, value)` | Store a value (supports dot-paths) |
| `get<T>(ns, key)` | Retrieve a value |
| `has(ns, key)` | Check existence |
| `remove(ns, key)` | Delete a key |
| `keys(ns)` | List all top-level keys |
| `entries(ns)` | All `[key, value]` pairs |

### Scoped namespaces

| Function | Description |
|----------|-------------|
| `scope(ns, path)` | Create / retrieve a child namespace |
| `root(ns)` | Walk to the root |
| `parent(ns)` | Parent namespace or `null` |
| `path(ns)` | Dot-path from root |

### Event bus

| Function | Description |
|----------|-------------|
| `on(ns, event, handler)` | Subscribe; returns unsubscribe function |
| `off(ns, event, handler)` | Unsubscribe |
| `emit(ns, event, ...args)` | Emit synchronously |

Built-in events: `change`, `plugin:installed`, `plugin:uninstalled`, `router:before`, `router:after`.

### Serialisation

| Function | Description |
|----------|-------------|
| `toJSON(ns)` | Snapshot to plain object |
| `fromJSON(ns, json)` | Restore from snapshot |
| `clone(ns)` | Deep copy |
| `extend(ns, source)` | Merge keys from object or another namespace |

### App class

`createApp()` returns an `App` instance with a `.ns` namespace and a single `use()` method:

- `app.use(key)` → get
- `app.use(key, value)` → set (chainable)
- `app.use(plugin)` → install plugin (chainable, idempotent)
- `app.use(plugin, options)` → install plugin with options

Each `createApp()` is fully isolated — safe for micro-frontend pages sharing a document.

## Ecosystem

| Package | Purpose |
|---------|---------|
| [`@lopatnov/namespace-router`](https://www.npmjs.com/package/@lopatnov/namespace-router) | SPA routing |
| [`@lopatnov/namespace-plugin`](https://www.npmjs.com/package/@lopatnov/namespace-plugin) | Plugin system for pure-function users |
| [`@lopatnov/namespace-storage`](https://www.npmjs.com/package/@lopatnov/namespace-storage) | Persistent storage |
| [`@lopatnov/namespace-guards`](https://www.npmjs.com/package/@lopatnov/namespace-guards) | Route & service guards |
| [`@lopatnov/namespace-mvvm`](https://www.npmjs.com/package/@lopatnov/namespace-mvvm) | Reactive DOM bindings |
| [`@lopatnov/namespace-pwa`](https://www.npmjs.com/package/@lopatnov/namespace-pwa) | PWA utilities |
| [`@lopatnov/namespace-component`](https://www.npmjs.com/package/@lopatnov/namespace-component) | Reusable components |
| [`@lopatnov/namespace-microfrontends`](https://www.npmjs.com/package/@lopatnov/namespace-microfrontends) | Cross-tab bus + leader election |

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
