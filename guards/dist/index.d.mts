import { Namespace } from "@lopatnov/namespace";
import { Router } from "@lopatnov/namespace-router";

//#region src/index.d.ts
interface GuardContext {
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
type GuardFn = (ctx: GuardContext) => boolean | string;
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
declare function guard(router: Router, pattern: string, fn: GuardFn): () => void;
/**
 * Protect a namespace key with an access check function.
 * Multiple protections on the same key are AND-combined.
 * Returns an unsubscribe function.
 *
 * @example
 * protect(app.ns, 'payment', () => !!get(app.ns, 'user'));
 */
declare function protect(ns: Namespace, key: string, fn: () => boolean): () => void;
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
declare function allowed(ns: Namespace, key: string): boolean;
//#endregion
export { GuardContext, GuardFn, allowed, guard, protect };