# @lopatnov/namespace-router

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-router)](https://www.npmjs.com/package/@lopatnov/namespace-router)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-router)](LICENSE)

SPA router for `@lopatnov/namespace`. Hash and history modes, route parameters, lazy loading, and programmatic navigation.

## Install

```sh
npm install @lopatnov/namespace @lopatnov/namespace-router
```

## Quick start

```ts
import { createNamespace } from '@lopatnov/namespace';
import { createRouter, route, lazyRoute, navigate, start } from '@lopatnov/namespace-router';

const ns = createNamespace();
const router = createRouter(ns, { mode: 'hash', root: '#app' });

route(router, '/', (container) => { container.innerHTML = '<h1>Home</h1>'; });
route(router, '/users/:id', (container, params) => {
  container.innerHTML = `<p>User: ${params.id}</p>`;
});

// Lazy-loaded page
route(router, '/settings', lazyRoute(() => import('./pages/settings')));

start(router);
```

## API

| Function | Description |
|----------|-------------|
| `createRouter(ns, options?)` | Create a router; registers it in the namespace |
| `start(router)` | Begin listening to navigation events |
| `stop(router)` | Stop listening |
| `route(router, pattern, handler)` | Register a route. Supports `:param` and `*` wildcard |
| `lazyRoute(loader)` | Wrap a dynamic `import()` as a route handler |
| `navigate(router, path)` | Navigate programmatically |
| `back()` | `history.back()` |
| `forward()` | `history.forward()` |
| `getCurrentPath(router)` | Current path string |

### Route handler signature

```ts
type RouteHandler = (
  container: Element,
  params: Record<string, string>,
  query: URLSearchParams
) => void | (() => void) | Promise<undefined | (() => void)>;
```

Return a cleanup function to run before the next navigation.

### Lazy routes

A lazy route module must export a `default` route handler:

```ts
// pages/settings.ts
export default function settings(container: Element) {
  container.innerHTML = '<h1>Settings</h1>';
}
```

### Router options

```ts
interface RouterOptions {
  mode?: 'history' | 'hash'; // default: 'hash'
  root?: string;             // CSS selector for the render container; default: '#app'
}
```

### Events (on namespace)

- `router:before` — fired before navigation
- `router:after` — fired after the new page renders

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
