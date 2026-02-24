import { createNamespace, get, set } from "@lopatnov/namespace";
import type { Router } from "@lopatnov/namespace-router";
import { createRouter, navigate, route, start, stop } from "@lopatnov/namespace-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { allowed, guard, protect } from "../src/index";

// --- DOM setup ---

function setupDOM() {
  document.body.innerHTML = '<div id="app"></div>';
}

// --- Tests: guard ---

describe("guard", () => {
  let router: Router;

  beforeEach(() => {
    setupDOM();
    const ns = createNamespace();
    router = createRouter(ns, { mode: "hash", root: "#app" });
  });

  afterEach(() => {
    stop(router);
  });

  it("allows navigation when guard returns true", async () => {
    const handler = vi.fn();
    route(router, "/protected", handler);
    guard(router, "/protected", () => true);

    window.location.hash = "#/protected";
    start(router);

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it("cancels navigation when guard returns false", async () => {
    const handler = vi.fn();
    route(router, "/protected", handler);
    route(router, "/", vi.fn());
    guard(router, "/protected", () => false);

    window.location.hash = "";
    start(router);

    await vi.waitFor(() => expect(router.currentPath).toBe("/"));

    navigate(router, "/protected");

    await new Promise((r) => setTimeout(r, 20));

    expect(handler).not.toHaveBeenCalled();
  });

  it("redirects when guard returns a path string", async () => {
    const protectedHandler = vi.fn();
    const loginHandler = vi.fn();

    route(router, "/protected", protectedHandler);
    route(router, "/login", loginHandler);
    route(router, "/", vi.fn());

    guard(router, "/protected", () => "/login");

    window.location.hash = "";
    start(router);

    await vi.waitFor(() => expect(router.currentPath).toBe("/"));

    navigate(router, "/protected");

    await vi.waitFor(() => {
      expect(loginHandler).toHaveBeenCalledTimes(1);
    });

    expect(protectedHandler).not.toHaveBeenCalled();
  });

  it("unsubscribe removes the guard", async () => {
    const handler = vi.fn();
    route(router, "/page", handler);
    route(router, "/", vi.fn());

    const unsub = guard(router, "/page", () => false);
    unsub();

    window.location.hash = "#/page";
    start(router);

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it("guard pattern with wildcard matches sub-paths", async () => {
    const adminHandler = vi.fn();
    route(router, "/admin/users", adminHandler);
    guard(router, "/admin/*", () => false);

    window.location.hash = "#/admin/users";
    start(router);

    await new Promise((r) => setTimeout(r, 30));
    expect(adminHandler).not.toHaveBeenCalled();
  });

  it("passes path and query to guard context", async () => {
    const guardFn = vi.fn().mockReturnValue(true);
    route(router, "/page", vi.fn());

    guard(router, "/page", guardFn);

    window.location.hash = "#/page";
    start(router);

    await vi.waitFor(() => expect(guardFn).toHaveBeenCalled());

    const ctx = guardFn.mock.calls[0][0];
    expect(ctx.path).toBe("/page");
    expect(ctx.query).toBeInstanceOf(URLSearchParams);
  });
});

// --- Tests: protect / allowed ---

describe("protect / allowed", () => {
  it("unprotected key is always allowed", () => {
    const ns = createNamespace();
    expect(allowed(ns, "anything")).toBe(true);
  });

  it("protect with fn returning true allows access", () => {
    const ns = createNamespace();
    protect(ns, "payment", () => true);
    expect(allowed(ns, "payment")).toBe(true);
  });

  it("protect with fn returning false denies access", () => {
    const ns = createNamespace();
    protect(ns, "payment", () => false);
    expect(allowed(ns, "payment")).toBe(false);
  });

  it("multiple protections are AND-combined", () => {
    const ns = createNamespace();
    protect(ns, "premium", () => true);
    protect(ns, "premium", () => false);
    expect(allowed(ns, "premium")).toBe(false);
  });

  it("unsubscribe removes protection", () => {
    const ns = createNamespace();
    const unsub = protect(ns, "resource", () => false);

    expect(allowed(ns, "resource")).toBe(false);

    unsub();
    expect(allowed(ns, "resource")).toBe(true);
  });

  it("protection checks namespace state dynamically", () => {
    const ns = createNamespace();
    set(ns, "user", null);

    protect(ns, "payment", () => !!get(ns, "user"));

    expect(allowed(ns, "payment")).toBe(false);

    set(ns, "user", { name: "Alice" });
    expect(allowed(ns, "payment")).toBe(true);
  });
});
