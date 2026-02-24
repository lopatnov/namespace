// ============================================================
// @lopatnov/namespace-router — SPA Router
// Pure tree-shakeable functions. ES2024.
// ============================================================

import type { Namespace } from "@lopatnov/namespace";
import { emit, set } from "@lopatnov/namespace";

// --- Types ---

/** Route handler receives a container element and parsed params. Returns optional cleanup function. */
export type RouteHandler = (
  container: Element,
  params: Record<string, string>,
  query: URLSearchParams,
) => void | (() => void) | Promise<undefined | (() => void)>;

/** Lazy route wrapper — a function that returns a dynamic import promise. */
export type LazyRouteLoader = () => Promise<{ default: RouteHandler }>;

export interface RouteEntry {
  pattern: string;
  regex: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export interface Router {
  ns: Namespace;
  routes: RouteEntry[];
  mode: "history" | "hash";
  root: string;
  container: Element | null;
  currentCleanup: (() => void) | null;
  currentPath: string;
  unlisten: (() => void) | null;
}

export interface RouterOptions {
  /** 'history' (pushState) or 'hash' (location.hash). Default: 'hash'. */
  mode?: "history" | "hash";
  /** CSS selector for the container element where pages render. */
  root?: string;
}

// --- Core ---

/** Create a router and register it in the namespace. */
export function createRouter(ns: Namespace, options: RouterOptions = {}): Router {
  const router: Router = {
    ns,
    routes: [],
    mode: options.mode ?? "hash",
    root: options.root ?? "#app",
    container: null,
    currentCleanup: null,
    currentPath: "",
    unlisten: null,
  };

  // Register in namespace
  set(ns, "router", router);

  return router;
}

/** Start the router — listen to URL changes and handle the current URL. */
export function start(router: Router): void {
  if (typeof document === "undefined") return; // SSR guard

  router.container = document.querySelector(router.root);
  if (!router.container) {
    throw new Error(`Router container not found: "${router.root}"`);
  }

  if (router.mode === "history") {
    const handler = () => handleNavigation(router);
    window.addEventListener("popstate", handler);
    router.unlisten = () => window.removeEventListener("popstate", handler);
  } else {
    const handler = () => handleNavigation(router);
    window.addEventListener("hashchange", handler);
    router.unlisten = () => window.removeEventListener("hashchange", handler);
  }

  // Intercept clicks on [data-nav] links
  const clickHandler = (e: Event) => {
    const target = (e.target as Element)?.closest?.("[data-nav]");
    if (!target) return;

    const href = target.getAttribute("href");
    if (!href) return;

    e.preventDefault();
    navigate(router, href);
  };
  document.addEventListener("click", clickHandler);

  const originalUnlisten = router.unlisten;
  router.unlisten = () => {
    originalUnlisten?.();
    document.removeEventListener("click", clickHandler);
  };

  // Handle current URL
  handleNavigation(router);
}

/** Stop the router — remove all listeners and cleanup current route. */
export function stop(router: Router): void {
  router.unlisten?.();
  router.unlisten = null;
  router.currentCleanup?.();
  router.currentCleanup = null;
}

/** Register a route. */
export function route(router: Router, pattern: string, handler: RouteHandler): void {
  const { regex, paramNames } = compilePattern(pattern);
  router.routes.push({ pattern, regex, paramNames, handler });
}

/** Navigate to a path programmatically. */
export function navigate(router: Router, path: string): void {
  if (router.mode === "history") {
    window.history.pushState(null, "", path);
  } else {
    window.location.hash = path.startsWith("#") ? path : `#${path}`;
    return; // hashchange will trigger handleNavigation
  }

  handleNavigation(router);
}

/** Go back in browser history. */
export function back(): void {
  window.history.back();
}

/** Go forward in browser history. */
export function forward(): void {
  window.history.forward();
}

/** Create a lazy route handler from a dynamic import. */
export function lazyRoute(loader: LazyRouteLoader): RouteHandler {
  let cached: RouteHandler | null = null;

  return async (container, params, query) => {
    if (!cached) {
      const mod = await loader();
      cached = mod.default;
    }
    const result = cached(container, params, query);
    return (result instanceof Promise ? await result : result) ?? undefined;
  };
}

/** Get the current route path. */
export function getCurrentPath(router: Router): string {
  return router.currentPath;
}

// --- Internal ---

function getPathFromURL(mode: "history" | "hash"): string {
  if (mode === "history") {
    return window.location.pathname;
  }
  const hash = window.location.hash;
  return hash ? hash.slice(1) : "/";
}

function compilePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

  // Escape special regex chars except : and *
  const regexStr = pattern
    .replace(/([.+?^${}()|[\]\\])/g, "\\$1")
    .replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    })
    .replace(/\*/g, ".*");

  return {
    regex: new RegExp(`^${regexStr}$`),
    paramNames,
  };
}

function matchRoute(
  routes: RouteEntry[],
  path: string,
): { entry: RouteEntry; params: Record<string, string> } | null {
  // Strip query string for matching
  const pathOnly = path.split("?")[0];

  for (const entry of routes) {
    const match = pathOnly.match(entry.regex);
    if (match) {
      const params: Record<string, string> = {};
      entry.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { entry, params };
    }
  }
  return null;
}

async function handleNavigation(router: Router): Promise<void> {
  const fullPath = getPathFromURL(router.mode);
  const [pathOnly, queryStr] = fullPath.split("?");
  const query = new URLSearchParams(queryStr ?? "");

  // Don't re-navigate to the same path
  if (pathOnly === router.currentPath) return;

  // Let guards intercept before we tear down the current page.
  const nav = { path: pathOnly, query, cancelled: false, redirectTo: null as string | null };
  emit(router.ns, "router:beforeNavigate", nav);

  if (nav.cancelled) {
    if (router.mode === "history") {
      window.history.replaceState(null, "", router.currentPath || "/");
    } else {
      const cur = router.currentPath || "/";
      window.location.hash = cur.startsWith("#") ? cur : `#${cur}`;
    }
    return;
  }

  if (nav.redirectTo) {
    navigate(router, nav.redirectTo);
    return;
  }

  // Cleanup previous route
  router.currentCleanup?.();
  router.currentCleanup = null;

  router.currentPath = pathOnly;

  const matched = matchRoute(router.routes, pathOnly);
  if (!matched) {
    // Try notFound route
    const notFound = matchRoute(router.routes, "*");
    if (notFound && router.container) {
      const cleanup = await notFound.entry.handler(router.container, {}, query);
      if (typeof cleanup === "function") router.currentCleanup = cleanup;
    }
    emit(router.ns, "router:notfound", pathOnly);
    return;
  }

  if (!router.container) return;

  emit(router.ns, "router:before", pathOnly, matched.params);

  try {
    const cleanup = await matched.entry.handler(router.container, matched.params, query);
    if (typeof cleanup === "function") router.currentCleanup = cleanup;
    emit(router.ns, "router:after", pathOnly, matched.params);
  } catch (err) {
    emit(router.ns, "router:error", pathOnly, err);
  }
}
