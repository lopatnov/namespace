import { Namespace } from "@lopatnov/namespace";

//#region src/index.d.ts
/** Route handler receives a container element and parsed params. Returns optional cleanup function. */
type RouteHandler = (container: Element, params: Record<string, string>, query: URLSearchParams) => void | (() => void) | Promise<undefined | (() => void)>;
/** Lazy route wrapper — a function that returns a dynamic import promise. */
type LazyRouteLoader = () => Promise<{
  default: RouteHandler;
}>;
interface RouteEntry {
  pattern: string;
  regex: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}
interface Router {
  ns: Namespace;
  routes: RouteEntry[];
  mode: "history" | "hash";
  root: string;
  container: Element | null;
  currentCleanup: (() => void) | null;
  currentPath: string;
  unlisten: (() => void) | null;
}
interface RouterOptions {
  /** 'history' (pushState) or 'hash' (location.hash). Default: 'hash'. */
  mode?: "history" | "hash";
  /** CSS selector for the container element where pages render. */
  root?: string;
}
/** Create a router and register it in the namespace. */
declare function createRouter(ns: Namespace, options?: RouterOptions): Router;
/** Start the router — listen to URL changes and handle the current URL. */
declare function start(router: Router): void;
/** Stop the router — remove all listeners and cleanup current route. */
declare function stop(router: Router): void;
/** Register a route. */
declare function route(router: Router, pattern: string, handler: RouteHandler): void;
/** Navigate to a path programmatically. */
declare function navigate(router: Router, path: string): void;
/** Go back in browser history. */
declare function back(): void;
/** Go forward in browser history. */
declare function forward(): void;
/** Create a lazy route handler from a dynamic import. */
declare function lazyRoute(loader: LazyRouteLoader): RouteHandler;
/** Get the current route path. */
declare function getCurrentPath(router: Router): string;
//#endregion
export { LazyRouteLoader, RouteEntry, RouteHandler, Router, RouterOptions, back, createRouter, forward, getCurrentPath, lazyRoute, navigate, route, start, stop };