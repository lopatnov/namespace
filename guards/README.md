# @lopatnov/namespace-guards

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-guards)](https://www.npmjs.com/package/@lopatnov/namespace-guards)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-guards)](LICENSE)

Route guards and namespace access checks for `@lopatnov/namespace`. Intercept navigation with predicates, redirect unauthenticated users, and protect namespace keys from unauthorized reads.

## Install

```sh
npm install @lopatnov/namespace @lopatnov/namespace-router @lopatnov/namespace-guards
```

## Quick start

### Route guard

```ts
import { createNamespace, get } from '@lopatnov/namespace';
import { createRouter, start } from '@lopatnov/namespace-router';
import { guard } from '@lopatnov/namespace-guards';

const ns = createNamespace();
const router = createRouter(ns, { mode: 'hash', root: '#app' });

// Redirect unauthenticated users
const unguard = guard(router, '/dashboard/*', ({ path }) => {
  const user = get(ns, 'user');
  return user ? true : '/login';
});

start(router);

// Remove the guard when no longer needed
unguard();
```

### Namespace protection

```ts
import { protect, allowed } from '@lopatnov/namespace-guards';

protect(ns, 'admin.config', () => get<boolean>(ns, 'user.isAdmin') === true);

allowed(ns, 'admin.config'); // false if user is not admin
```

## API

| Function | Description |
|----------|-------------|
| `guard(router, pattern, fn)` | Register a route guard. Returns unsubscribe function |
| `protect(ns, key, fn)` | Protect a namespace key with an access predicate. Returns unsubscribe function |
| `allowed(ns, key)` | Returns `true` if all predicates for the key pass |

### Guard function

```ts
type GuardFn = (ctx: GuardContext) => boolean | string;

interface GuardContext {
  path: string;
  query: URLSearchParams;
}
```

Return values:
- `true` — allow navigation
- `false` — cancel (stay on current page)
- `string` — redirect to this path

### Patterns

Route patterns support `:param` named segments and `*` wildcard, identical to `route()` in `@lopatnov/namespace-router`.

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
