// ============================================================
// @lopatnov/namespace-guards — Route & service guards
// Pure tree-shakeable functions. ES2024.
// ============================================================

import type { Namespace } from "@lopatnov/namespace";
import { on } from "@lopatnov/namespace";
import type { Router } from "@lopatnov/namespace-router";

// --- Types ---

export interface GuardContext {
  /** The path being navigated to. */
  path: string;
  /** Parsed query string. */
  query: URLSearchParams;
}

/**
 * Guard function. Return values:
 * - `true`  — allow navigation
 * - `false` — cancel navigation (stay on current page)
 * - `string` — redirect to this path
 */
export type GuardFn = (ctx: GuardContext) => boolean | string;

// --- Internal state ---

interface GuardEntry {
  regex: RegExp;
  fn: GuardFn;
}

// Keyed by router object reference
const _routerGuards = new WeakMap<Router, GuardEntry[]>();
// Keyed by namespace
const _protections = new WeakMap<Namespace, Map<string, Array<() => boolean>>>();

// --- Utilities ---

function compilePattern(pattern: string): RegExp {
  const regexStr = pattern
    .replace(/([.+?^${}()|[\]\\])/g, "\\$1")
    .replace(/:(\w+)/g, "([^/]+)")
    .replace(/\*/g, ".*");
  return new RegExp(`^${regexStr}$`);
}

// --- Route guards ---

/**
 * Register a route guard. The guard function is called synchronously before
 * every navigation to a path matching `pattern`.
 *
 * - Return `true` to allow navigation.
 * - Return `false` to cancel navigation (URL stays on current page).
 * - Return a path string to redirect.
 *
 * Patterns support `:param` and `*` wildcard (same as `route()`).
 * Returns an unsubscribe function.
 *
 * @example
 * guard(router, '/admin/*', ({ path }) => {
 *   return get(app, 'user.isAdmin') ? true : '/login';
 * });
 */
export function guard(router: Router, pattern: string, fn: GuardFn): () => void {
  if (!_routerGuards.has(router)) {
    _routerGuards.set(router, []);

    // Hook into router:beforeNavigate once per router
    on(router.ns, "router:beforeNavigate", (nav: unknown) => {
      const navObj = nav as {
        path: string;
        query: URLSearchParams;
        cancelled: boolean;
        redirectTo: string | null;
      };

      if (navObj.cancelled || navObj.redirectTo !== null) return;

      const entries = _routerGuards.get(router) ?? [];
      for (const entry of entries) {
        if (!entry.regex.test(navObj.path)) continue;

        const result = entry.fn({ path: navObj.path, query: navObj.query });

        if (result === false) {
          navObj.cancelled = true;
          return;
        }
        if (typeof result === "string") {
          navObj.redirectTo = result;
          return;
        }
      }
    });
  }

  const entry: GuardEntry = { regex: compilePattern(pattern), fn };
  _routerGuards.get(router)!.push(entry);

  return () => {
    const list = _routerGuards.get(router);
    if (list) {
      const idx = list.indexOf(entry);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

// --- Namespace service guards ---

/**
 * Protect a namespace key with an access check function.
 * Multiple protections on the same key are AND-combined.
 * Returns an unsubscribe function.
 *
 * @example
 * protect(app.ns, 'payment', () => !!get(app.ns, 'user'));
 */
export function protect(ns: Namespace, key: string, fn: () => boolean): () => void {
  let map = _protections.get(ns);
  if (!map) {
    map = new Map();
    _protections.set(ns, map);
  }

  let fns = map.get(key);
  if (!fns) {
    fns = [];
    map.set(key, fns);
  }
  fns.push(fn);

  return () => {
    const fnsArr = _protections.get(ns)?.get(key);
    if (fnsArr) {
      const idx = fnsArr.indexOf(fn);
      if (idx !== -1) fnsArr.splice(idx, 1);
    }
  };
}

/**
 * Check whether access to a protected namespace key is allowed.
 * Returns `true` if no protections are registered, or if all registered
 * protection functions return `true`.
 *
 * @example
 * if (allowed(app.ns, 'payment')) {
 *   const svc = get(app.ns, 'payment');
 * }
 */
export function allowed(ns: Namespace, key: string): boolean {
  const fns = _protections.get(ns)?.get(key);
  if (!fns || fns.length === 0) return true;
  return fns.every((fn) => fn());
}
