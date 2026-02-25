import { createNamespace, inject, on } from "@lopatnov/namespace";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteHandler, Router } from "../src/index";
import {
  createRouter,
  getCurrentPath,
  lazyRoute,
  navigate,
  route,
  start,
  stop,
} from "../src/index";

// --- DOM / browser mocks ---

function setupDOM() {
  // Minimal DOM for testing
  document.body.innerHTML = '<div id="app"></div>';
}

function setupHashMode() {
  window.location.hash = "";
}

// --- Tests ---

describe("createRouter", () => {
  it("creates a router and registers it in namespace", () => {
    const ns = createNamespace();
    const router = createRouter(ns, { mode: "hash", root: "#app" });

    expect(router.mode).toBe("hash");
    expect(router.root).toBe("#app");
    expect(router.routes).toEqual([]);
    expect(inject(ns, "router")).toBe(router);
  });

  it("defaults to hash mode and #app root", () => {
    const ns = createNamespace();
    const router = createRouter(ns);

    expect(router.mode).toBe("hash");
    expect(router.root).toBe("#app");
  });
});

describe("route", () => {
  it("registers a route", () => {
    const ns = createNamespace();
    const router = createRouter(ns);
    const handler: RouteHandler = vi.fn();

    route(router, "/", handler);
    route(router, "/about", handler);
    route(router, "/users/:id", handler);

    expect(router.routes).toHaveLength(3);
  });

  it("compiles route patterns with params", () => {
    const ns = createNamespace();
    const router = createRouter(ns);
    const handler: RouteHandler = vi.fn();

    route(router, "/users/:id/posts/:postId", handler);

    const entry = router.routes[0];
    expect(entry.paramNames).toEqual(["id", "postId"]);
    expect(entry.regex.test("/users/42/posts/7")).toBe(true);
    expect(entry.regex.test("/users/42")).toBe(false);
  });
});

describe("navigation (hash mode)", () => {
  let router: Router;

  beforeEach(() => {
    setupDOM();
    setupHashMode();
    const ns = createNamespace();
    router = createRouter(ns, { mode: "hash", root: "#app" });
  });

  afterEach(() => {
    stop(router);
  });

  it("matches root route on start", async () => {
    const handler = vi.fn();
    route(router, "/", handler);

    window.location.hash = "";
    start(router);

    // Wait for async handling
    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });

    const container = document.querySelector("#app")!;
    expect(handler).toHaveBeenCalledWith(container, {}, expect.any(URLSearchParams));
  });

  it("navigates to a route and calls handler", async () => {
    const homeHandler = vi.fn();
    const aboutHandler = vi.fn();

    route(router, "/", homeHandler);
    route(router, "/about", aboutHandler);

    window.location.hash = "";
    start(router);

    await vi.waitFor(() => expect(homeHandler).toHaveBeenCalledTimes(1));

    navigate(router, "/about");

    await vi.waitFor(() => {
      expect(aboutHandler).toHaveBeenCalledTimes(1);
    });
  });

  it("extracts route params", async () => {
    const handler = vi.fn();
    route(router, "/users/:id", handler);

    window.location.hash = "#/users/42";
    start(router);

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledWith(
        expect.any(Element),
        { id: "42" },
        expect.any(URLSearchParams),
      );
    });
  });

  it("calls cleanup when navigating away", async () => {
    const cleanup = vi.fn();
    const handlerA: RouteHandler = () => cleanup;
    const handlerB: RouteHandler = vi.fn();

    route(router, "/a", handlerA);
    route(router, "/b", handlerB);

    window.location.hash = "#/a";
    start(router);

    await vi.waitFor(() => expect(router.currentPath).toBe("/a"));

    navigate(router, "/b");

    await vi.waitFor(() => {
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  it("getCurrentPath returns current path", async () => {
    const handler = vi.fn();
    route(router, "/test", handler);

    window.location.hash = "#/test";
    start(router);

    await vi.waitFor(() => {
      expect(getCurrentPath(router)).toBe("/test");
    });
  });
});

describe("lazyRoute", () => {
  it("creates a handler that calls loader and caches the result", async () => {
    const innerHandler: RouteHandler = vi.fn();
    const loader = vi.fn().mockResolvedValue({ default: innerHandler });

    const handler = lazyRoute(loader);
    const container = document.createElement("div");
    const params = { id: "1" };
    const query = new URLSearchParams();

    await handler(container, params, query);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(innerHandler).toHaveBeenCalledWith(container, params, query);

    // Second call uses cache
    await handler(container, params, query);
    expect(loader).toHaveBeenCalledTimes(1); // not called again
    expect(innerHandler).toHaveBeenCalledTimes(2);
  });
});

describe("events", () => {
  it("emits router:before and router:after", async () => {
    setupDOM();
    const ns = createNamespace();
    const router = createRouter(ns, { mode: "hash", root: "#app" });

    const beforeHandler = vi.fn();
    const afterHandler = vi.fn();
    on(ns, "router:before", beforeHandler);
    on(ns, "router:after", afterHandler);

    route(router, "/test", vi.fn());

    window.location.hash = "#/test";
    start(router);

    await vi.waitFor(() => {
      expect(beforeHandler).toHaveBeenCalledWith("/test", {});
      expect(afterHandler).toHaveBeenCalledWith("/test", {});
    });

    stop(router);
  });

  it("emits router:notfound for unmatched routes", async () => {
    setupDOM();
    const ns = createNamespace();
    const router = createRouter(ns, { mode: "hash", root: "#app" });

    const notFoundHandler = vi.fn();
    on(ns, "router:notfound", notFoundHandler);

    route(router, "/known", vi.fn());

    window.location.hash = "#/unknown";
    start(router);

    await vi.waitFor(() => {
      expect(notFoundHandler).toHaveBeenCalledWith("/unknown");
    });

    stop(router);
  });

  it("emits router:error when handler throws", async () => {
    setupDOM();
    const ns = createNamespace();
    const router = createRouter(ns, { mode: "hash", root: "#app" });

    const error = new Error("boom");
    const errorHandler = vi.fn();
    on(ns, "router:error", errorHandler);

    route(router, "/fail", () => {
      throw error;
    });

    window.location.hash = "#/fail";
    start(router);

    await vi.waitFor(() => {
      expect(errorHandler).toHaveBeenCalledWith("/fail", error);
    });

    stop(router);
  });
});

describe("stop", () => {
  it("removes listeners and runs cleanup", async () => {
    setupDOM();
    const ns = createNamespace();
    const router = createRouter(ns, { mode: "hash", root: "#app" });

    const cleanup = vi.fn();
    route(router, "/", () => cleanup);

    window.location.hash = "";
    start(router);

    await vi.waitFor(() => expect(router.currentPath).toBe("/"));

    stop(router);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(router.unlisten).toBeNull();
  });
});
