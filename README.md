# @lopatnov/namespace

> Lightweight modular namespace ecosystem for structured applications.
> Tree-shakeable pure functions, ES2024, zero dependencies.
> This project is an experiment in working with artificial intelligence.

[![npm downloads](https://img.shields.io/npm/dt/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace)
[![npm version](https://badge.fury.io/js/%40lopatnov%2Fnamespace.svg)](https://www.npmjs.com/package/@lopatnov/namespace)
[![License](https://img.shields.io/github/license/lopatnov/namespace)](https://github.com/lopatnov/namespace/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/lopatnov/namespace)](https://github.com/lopatnov/namespace/issues)
[![GitHub stars](https://img.shields.io/github/stars/lopatnov/namespace)](https://github.com/lopatnov/namespace/stargazers)

> **Early access:** API is stable but the ecosystem is actively evolving.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Example](#example)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Built With](#built-with)
- [License](#license)

---

## Installation

```bash
npm install @lopatnov/namespace
npm install @lopatnov/namespace-router   # SPA routing (optional)
```

---

## Usage

### ES Modules

```typescript
import {
  createNamespace,
  provide,
  inject,
  on,
  scope,
} from "@lopatnov/namespace";
import {
  createRouter,
  route,
  lazyRoute,
  start,
} from "@lopatnov/namespace-router";
```

### CommonJS

```javascript
const { createNamespace, provide, inject } = require("@lopatnov/namespace");
const { createRouter, route, start } = require("@lopatnov/namespace-router");
```

---

## API

### Core (`@lopatnov/namespace`)

| Function          | Signature                            | Description                              |
| ----------------- | ------------------------------------ | ---------------------------------------- |
| `createNamespace` | `() => Namespace`                    | Create a new root namespace              |
| `provide`         | `(ns, key, value) => void`           | Register a value (dot-paths supported)   |
| `inject`          | `(ns, key) => T \| undefined`        | Retrieve a value                         |
| `has`             | `(ns, key) => boolean`               | Check if key exists                      |
| `remove`          | `(ns, key) => boolean`               | Remove a key and its subtree             |
| `keys`            | `(ns) => string[]`                   | List immediate child keys                |
| `entries`         | `(ns) => [string, unknown][]`        | List immediate entries                   |
| `scope`           | `(ns, path) => Namespace`            | Get or create a child namespace          |
| `root`            | `(ns) => Namespace`                  | Get root namespace from any child        |
| `parent`          | `(ns) => Namespace \| null`          | Get parent namespace                     |
| `path`            | `(ns) => string`                     | Get dot-path from root                   |
| `on`              | `(ns, event, handler) => () => void` | Subscribe to event (returns unsubscribe) |
| `off`             | `(ns, event, handler) => void`       | Unsubscribe from event                   |
| `emit`            | `(ns, event, ...args) => void`       | Emit an event                            |
| `toJSON`          | `(ns) => Record<string, unknown>`    | Serialize namespace tree                 |
| `fromJSON`        | `(data) => Namespace`                | Restore namespace from plain object      |
| `clone`           | `(ns) => Namespace`                  | Deep clone a namespace                   |
| `merge`           | `(ns, data) => void`                 | Merge plain object into namespace        |

### Router (`@lopatnov/namespace-router`)

| Function         | Signature                            | Description                               |
| ---------------- | ------------------------------------ | ----------------------------------------- |
| `createRouter`   | `(ns, options?) => Router`           | Create a router (hash/history mode)       |
| `route`          | `(router, pattern, handler) => void` | Register a route (`:param`, `*` wildcard) |
| `navigate`       | `(router, path) => void`             | Navigate programmatically                 |
| `lazyRoute`      | `(loader) => RouteHandler`           | Lazy-load a route module on demand        |
| `start`          | `(router) => void`                   | Start listening to URL changes            |
| `stop`           | `(router) => void`                   | Stop the router                           |
| `back`           | `() => void`                         | Go back in history                        |
| `forward`        | `() => void`                         | Go forward in history                     |
| `getCurrentPath` | `(router) => string`                 | Get current route path                    |

---

## Example

```typescript
import {
  createNamespace,
  provide,
  inject,
  on,
  scope,
} from "@lopatnov/namespace";
import {
  createRouter,
  route,
  lazyRoute,
  start,
} from "@lopatnov/namespace-router";

const app = createNamespace();

// Services
provide(app, "api.baseUrl", "/api/v1");

// Scoped namespaces
const auth = scope(app, "auth");
provide(auth, "currentUser", null);

// Events bubble up to root
on(app, "change", (key, val) => console.log(`${key} =`, val));

// SPA Router with lazy loading
const router = createRouter(app, { mode: "hash", root: "#app" });
route(
  router,
  "/",
  lazyRoute(() => import("./pages/home")),
);
route(
  router,
  "/users/:id",
  lazyRoute(() => import("./pages/user")),
);
start(router);
```

---

## Documentation

Full interactive documentation: **[lopatnov.github.io/namespace](https://lopatnov.github.io/namespace/)**

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](legacy/CONTRIBUTING.md) before opening a pull request.

- Bug reports → [open an issue](https://github.com/lopatnov/namespace/issues)
- Questions → [Discussions](https://github.com/lopatnov/namespace/discussions)
- Found it useful? A [star on GitHub](https://github.com/lopatnov/namespace) helps others discover the project

---

## Built With

- [TypeScript](https://www.typescriptlang.org/) — strict typing throughout
- [tsdown](https://tsdown.dev/) — fast TypeScript bundler
- [Vitest](https://vitest.dev/) — unit testing with coverage
- [Biome](https://biomejs.dev/) — linting and formatting

---

## License

[Apache-2.0](https://github.com/lopatnov/namespace/blob/master/LICENSE) © 2019–2026 [Oleksandr Lopatnov](https://github.com/lopatnov) · [LinkedIn](https://www.linkedin.com/in/lopatnov/)
