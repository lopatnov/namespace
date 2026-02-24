import { describe, expect, it, vi } from "vitest";
import type { Namespace, NamespacePlugin } from "../src/index";
import {
  App,
  clone,
  createApp,
  createNamespace,
  emit,
  entries,
  extend,
  fromJSON,
  get,
  has,
  keys,
  off,
  on,
  parent,
  path,
  remove,
  root,
  scope,
  set,
  toJSON,
} from "../src/index";

describe("createNamespace", () => {
  it("creates an empty namespace", () => {
    const ns = createNamespace();
    expect(keys(ns)).toEqual([]);
  });
});

describe("set / get", () => {
  it("stores and retrieves a value", () => {
    const ns = createNamespace();
    set(ns, "name", "Alice");
    expect(get(ns, "name")).toBe("Alice");
  });

  it("handles falsy values correctly (0, empty string, false, null)", () => {
    const ns = createNamespace();
    set(ns, "zero", 0);
    set(ns, "empty", "");
    set(ns, "no", false);
    set(ns, "nil", null);

    expect(get(ns, "zero")).toBe(0);
    expect(get(ns, "empty")).toBe("");
    expect(get(ns, "no")).toBe(false);
    expect(get(ns, "nil")).toBe(null);

    expect(has(ns, "zero")).toBe(true);
    expect(has(ns, "empty")).toBe(true);
    expect(has(ns, "no")).toBe(true);
    expect(has(ns, "nil")).toBe(true);
  });

  it("returns undefined for non-existent key", () => {
    const ns = createNamespace();
    expect(get(ns, "nope")).toBeUndefined();
  });

  it("overwrites existing value", () => {
    const ns = createNamespace();
    set(ns, "x", 1);
    set(ns, "x", 2);
    expect(get(ns, "x")).toBe(2);
  });

  it("supports dot-path for deep set/get", () => {
    const ns = createNamespace();
    set(ns, "config.db.host", "localhost");
    set(ns, "config.db.port", 5432);

    expect(get(ns, "config.db.host")).toBe("localhost");
    expect(get(ns, "config.db.port")).toBe(5432);
  });

  it("stores functions", () => {
    const ns = createNamespace();
    const fn = (x: number) => x * 2;
    set(ns, "double", fn);
    const result = get<(x: number) => number>(ns, "double");
    expect(result!(3)).toBe(6);
  });

  it("stores objects and arrays", () => {
    const ns = createNamespace();
    set(ns, "list", [1, 2, 3]);
    set(ns, "obj", { a: 1 });

    expect(get(ns, "list")).toEqual([1, 2, 3]);
    expect(get(ns, "obj")).toEqual({ a: 1 });
  });
});

describe("has", () => {
  it("returns true for existing key", () => {
    const ns = createNamespace();
    set(ns, "x", 42);
    expect(has(ns, "x")).toBe(true);
  });

  it("returns false for non-existent key", () => {
    const ns = createNamespace();
    expect(has(ns, "x")).toBe(false);
  });

  it("works with dot-paths", () => {
    const ns = createNamespace();
    set(ns, "a.b.c", 1);
    expect(has(ns, "a.b.c")).toBe(true);
    expect(has(ns, "a.b")).toBe(true);
    expect(has(ns, "a.b.d")).toBe(false);
    expect(has(ns, "a.z")).toBe(false);
  });
});

describe("remove", () => {
  it("removes a key", () => {
    const ns = createNamespace();
    set(ns, "x", 42);
    expect(remove(ns, "x")).toBe(true);
    expect(has(ns, "x")).toBe(false);
    expect(get(ns, "x")).toBeUndefined();
  });

  it("returns false for non-existent key", () => {
    const ns = createNamespace();
    expect(remove(ns, "x")).toBe(false);
  });

  it("removes deep paths", () => {
    const ns = createNamespace();
    set(ns, "a.b.c", 1);
    expect(remove(ns, "a.b.c")).toBe(true);
    expect(has(ns, "a.b.c")).toBe(false);
    expect(has(ns, "a.b")).toBe(true); // parent remains
  });
});

describe("keys / entries", () => {
  it("lists immediate child keys", () => {
    const ns = createNamespace();
    set(ns, "a", 1);
    set(ns, "b", 2);
    set(ns, "c.d", 3);
    expect(keys(ns).sort()).toEqual(["a", "b", "c"]);
  });

  it("returns entries", () => {
    const ns = createNamespace();
    set(ns, "x", 10);
    set(ns, "y", 20);
    const result = entries(ns).filter(([k]) => k === "x" || k === "y");
    expect(result).toEqual([
      ["x", 10],
      ["y", 20],
    ]);
  });
});

describe("scope", () => {
  it("creates a child namespace", () => {
    const ns = createNamespace();
    const auth = scope(ns, "auth");
    set(auth, "user", "Admin");

    expect(get(ns, "auth.user")).toBe("Admin");
  });

  it("returns existing scope", () => {
    const ns = createNamespace();
    const s1 = scope(ns, "auth");
    const s2 = scope(ns, "auth");
    expect(s1).toBe(s2);
  });

  it("creates deep scopes", () => {
    const ns = createNamespace();
    const db = scope(ns, "config.db");
    set(db, "host", "localhost");

    expect(get(ns, "config.db.host")).toBe("localhost");
  });
});

describe("root / parent / path", () => {
  it("root returns self for root namespace", () => {
    const ns = createNamespace();
    expect(root(ns)).toBe(ns);
  });

  it("root returns root from deep child", () => {
    const ns = createNamespace();
    const deep = scope(ns, "a.b.c");
    expect(root(deep)).toBe(ns);
  });

  it("parent returns null for root", () => {
    const ns = createNamespace();
    expect(parent(ns)).toBeNull();
  });

  it("parent returns parent namespace", () => {
    const ns = createNamespace();
    const child = scope(ns, "auth");
    expect(parent(child)).toBe(ns);
  });

  it("path returns dot-path from root", () => {
    const ns = createNamespace();
    expect(path(ns)).toBe("");

    const auth = scope(ns, "auth");
    expect(path(auth)).toBe("auth");

    const db = scope(ns, "config.db");
    expect(path(db)).toBe("config.db");
  });
});

describe("events: on / off / emit", () => {
  it("subscribes and receives events", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    on(ns, "test", handler);
    emit(ns, "test", 1, 2);
    expect(handler).toHaveBeenCalledWith(1, 2);
  });

  it("on() returns unsubscribe function", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    const unsub = on(ns, "test", handler);

    emit(ns, "test");
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    emit(ns, "test");
    expect(handler).toHaveBeenCalledTimes(1); // not called again
  });

  it("off() removes specific handler", () => {
    const ns = createNamespace();
    const h1 = vi.fn();
    const h2 = vi.fn();
    on(ns, "test", h1);
    on(ns, "test", h2);

    off(ns, "test", h1);
    emit(ns, "test");

    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it("emit does nothing if no handlers", () => {
    const ns = createNamespace();
    expect(() => emit(ns, "nonexistent")).not.toThrow();
  });

  it("set emits 'change' event", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    on(ns, "change", handler);

    set(ns, "x", 42);
    expect(handler).toHaveBeenCalledWith("x", 42, undefined);

    set(ns, "x", 100);
    expect(handler).toHaveBeenCalledWith("x", 100, 42);
  });

  it("change events bubble up from child scopes", () => {
    const ns = createNamespace();
    const rootHandler = vi.fn();
    on(ns, "change", rootHandler);

    set(ns, "auth.user", "Admin");
    expect(rootHandler).toHaveBeenCalledWith("auth.user", "Admin", undefined);
  });

  it("remove emits 'delete' event", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    on(ns, "delete", handler);

    set(ns, "x", 42);
    remove(ns, "x");
    expect(handler).toHaveBeenCalledWith("x");
  });
});

describe("toJSON / fromJSON / clone", () => {
  it("serializes namespace to plain object", () => {
    const ns = createNamespace();
    set(ns, "name", "App");
    set(ns, "config.db.host", "localhost");
    set(ns, "config.db.port", 5432);

    const json = toJSON(ns);
    expect(json).toEqual({
      name: "App",
      config: {
        db: {
          host: "localhost",
          port: 5432,
        },
      },
    });
  });

  it("skips functions during serialization", () => {
    const ns = createNamespace();
    set(ns, "name", "App");
    set(ns, "fn", () => 42);

    const json = toJSON(ns);
    expect(json).toEqual({ name: "App" });
  });

  it("deserializes plain object to namespace", () => {
    const data = {
      name: "App",
      config: { db: { host: "localhost", port: 5432 } },
    };
    const ns = fromJSON(data);

    expect(get(ns, "name")).toBe("App");
    expect(get(ns, "config.db.host")).toBe("localhost");
    expect(get(ns, "config.db.port")).toBe(5432);
  });

  it("clone creates independent copy", () => {
    const ns = createNamespace();
    set(ns, "x", 1);
    set(ns, "a.b", 2);

    const copy = clone(ns);
    set(copy, "x", 999);

    expect(get(ns, "x")).toBe(1); // original unchanged
    expect(get(copy, "x")).toBe(999);
  });
});

describe("extend", () => {
  it("merges plain object into namespace", () => {
    const ns = createNamespace();
    set(ns, "x", 1);

    extend(ns, { y: 2, nested: { a: 3 } });

    expect(get(ns, "x")).toBe(1);
    expect(get(ns, "y")).toBe(2);
    expect(get(ns, "nested.a")).toBe(3);
  });

  it("merges another namespace", () => {
    const ns1 = createNamespace();
    set(ns1, "a", 1);
    set(ns1, "b.c", 2);

    const ns2 = createNamespace();
    set(ns2, "d", 3);
    extend(ns2, ns1);

    expect(get(ns2, "a")).toBe(1);
    expect(get(ns2, "b.c")).toBe(2);
    expect(get(ns2, "d")).toBe(3);
  });

  it("preserves functions (unlike toJSON)", () => {
    const ns = createNamespace();
    const fn = () => 42;
    set(ns, "fn", fn);

    const ns2 = createNamespace();
    extend(ns2, ns);

    expect(get(ns2, "fn")).toBe(fn);
  });
});

describe("edge cases", () => {
  it("throws on empty path", () => {
    const ns = createNamespace();
    expect(() => set(ns, "", 1)).toThrow();
  });

  it("throws on path with double dots", () => {
    const ns = createNamespace();
    expect(() => set(ns, "a..b", 1)).toThrow();
  });

  it("handles many nested levels", () => {
    const ns = createNamespace();
    set(ns, "a.b.c.d.e.f.g", "deep");
    expect(get(ns, "a.b.c.d.e.f.g")).toBe("deep");
  });

  it("set overwrites non-namespace with namespace (scope re-creation)", () => {
    const ns = createNamespace();
    set(ns, "x", 42);
    // Now set a deep path through x — x becomes a namespace
    set(ns, "x.y", 1);
    expect(get(ns, "x.y")).toBe(1);
  });
});

// ============================================================
// createApp / App tests
// ============================================================

describe("createApp / App.use (set/get)", () => {
  it("sets and gets a value via use()", () => {
    const app = createApp();
    app.use("name", "Alice");
    expect(app.use("name")).toBe("Alice");
  });

  it("use(key) returns undefined for missing key", () => {
    const app = createApp();
    expect(app.use("missing")).toBeUndefined();
  });

  it("use(key, value) is chainable", () => {
    const app = createApp();
    const result = app.use("a", 1).use("b", 2).use("c", 3);
    expect(result).toBe(app);
    expect(app.use("a")).toBe(1);
    expect(app.use("b")).toBe(2);
    expect(app.use("c")).toBe(3);
  });

  it("supports typed get via generic", () => {
    const app = createApp();
    app.use("count", 42);
    const n = app.use<number>("count");
    expect(n).toBe(42);
  });

  it("has() reflects set state", () => {
    const app = createApp();
    expect(app.has("x")).toBe(false);
    app.use("x", 1);
    expect(app.has("x")).toBe(true);
  });

  it("remove() deletes a key and is chainable", () => {
    const app = createApp();
    app.use("x", 1);
    const result = app.remove("x");
    expect(result).toBe(app);
    expect(app.has("x")).toBe(false);
  });

  it("keys() returns registered keys", () => {
    const app = createApp();
    app.use("a", 1).use("b", 2);
    expect(app.keys().sort()).toEqual(["a", "b"]);
  });
});

describe("App events", () => {
  it("on/off/emit are chainable", () => {
    const app = createApp();
    const handler = vi.fn();
    const result = app.on("evt", handler);
    expect(result).toBe(app);

    app.emit("evt", 42);
    expect(handler).toHaveBeenCalledWith(42);

    app.off("evt", handler).emit("evt", 99);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("once() fires handler exactly once", () => {
    const app = createApp();
    const handler = vi.fn();
    app.once("evt", handler);

    app.emit("evt", 1);
    app.emit("evt", 2);
    app.emit("evt", 3);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });
});

describe("App scope / root / parent", () => {
  it("scope() returns a child App", () => {
    const app = createApp();
    const auth = app.scope("auth");
    expect(auth).toBeInstanceOf(App);
    auth.use("token", "abc");
    expect(app.use("auth.token")).toBe("abc");
  });

  it("root() returns top-level App", () => {
    const app = createApp();
    const child = app.scope("a.b.c");
    expect(child.root().ns).toBe(app.ns);
  });

  it("parent() returns null for root App", () => {
    const app = createApp();
    expect(app.parent()).toBeNull();
  });

  it("parent() returns parent App for scoped child", () => {
    const app = createApp();
    const auth = app.scope("auth");
    expect(auth.parent()!.ns).toBe(app.ns);
  });
});

describe("App extend / toJSON / clone", () => {
  it("extend() from plain object is chainable", () => {
    const app = createApp();
    const result = app.extend({ x: 1, y: 2 });
    expect(result).toBe(app);
    expect(app.use("x")).toBe(1);
  });

  it("extend() from another App", () => {
    const app1 = createApp();
    app1.use("a", 1);
    const app2 = createApp();
    app2.extend(app1);
    expect(app2.use("a")).toBe(1);
  });

  it("toJSON() returns plain object", () => {
    const app = createApp();
    app.use("name", "Test").use("config.env", "prod");
    expect(app.toJSON()).toEqual({ name: "Test", config: { env: "prod" } });
  });

  it("clone() creates independent copy", () => {
    const app = createApp();
    app.use("x", 1);
    const copy = app.clone();
    copy.use("x", 999);
    expect(app.use("x")).toBe(1);
    expect(copy.use("x")).toBe(999);
  });
});

describe("App plugins", () => {
  it("installs a plugin via use(plugin)", () => {
    const plugin: NamespacePlugin<void> = {
      id: "test-plugin",
      install(ns: Namespace) {
        set(ns, "pluginValue", 42);
      },
    };

    const app = createApp();
    const result = app.use(plugin);
    expect(result).toBe(app);
    expect(app.use("pluginValue")).toBe(42);
    expect(app.installed(plugin)).toBe(true);
    expect(app.installed("test-plugin")).toBe(true);
  });

  it("installs a plugin with options", () => {
    const plugin: NamespacePlugin<{ prefix: string }> = {
      id: "prefix-plugin",
      install(ns: Namespace, opts: { prefix: string }) {
        set(ns, "prefix", opts.prefix);
      },
    };

    const app = createApp();
    app.use(plugin, { prefix: "v3" });
    expect(app.use("prefix")).toBe("v3");
  });

  it("install is idempotent — second use() is a no-op", () => {
    const installFn = vi.fn();
    const plugin: NamespacePlugin<void> = {
      id: "once-plugin",
      install: installFn,
    };

    const app = createApp();
    app.use(plugin).use(plugin).use(plugin);
    expect(installFn).toHaveBeenCalledTimes(1);
  });

  it("emits plugin:installed event on install", () => {
    const handler = vi.fn();
    const plugin: NamespacePlugin<void> = { id: "evt-plugin", install: vi.fn() };

    const app = createApp();
    app.on("plugin:installed", handler);
    app.use(plugin);
    expect(handler).toHaveBeenCalledWith("evt-plugin");
  });

  it("unuse() calls uninstall and emits plugin:uninstalled", () => {
    const uninstallFn = vi.fn();
    const handler = vi.fn();
    const plugin: NamespacePlugin<void> = {
      id: "removable",
      install: vi.fn(),
      uninstall: uninstallFn,
    };

    const app = createApp();
    app.on("plugin:uninstalled", handler);
    app.use(plugin).unuse(plugin);

    expect(uninstallFn).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith("removable");
    expect(app.installed("removable")).toBe(false);
  });

  it("unuse() by string id", () => {
    const plugin: NamespacePlugin<void> = { id: "by-id", install: vi.fn() };
    const app = createApp();
    app.use(plugin).unuse("by-id");
    expect(app.installed("by-id")).toBe(false);
  });
});

describe("App.ns — namespace interop", () => {
  it("ns is the underlying Namespace", () => {
    const app = createApp();
    app.use("x", 1);
    expect(get(app.ns, "x")).toBe(1);
  });

  it("changes via pure functions are visible through App", () => {
    const app = createApp();
    set(app.ns, "y", 2);
    expect(app.use("y")).toBe(2);
  });
});

describe("Microfrontend isolation", () => {
  it("two createApp() instances are completely independent", () => {
    const shell = createApp();
    const widget = createApp();

    shell.use("config", { env: "prod" });
    widget.use("config", { env: "test" });

    expect(shell.use<{ env: string }>("config")!.env).toBe("prod");
    expect(widget.use<{ env: string }>("config")!.env).toBe("test");
  });

  it("events do not leak between apps", () => {
    const app1 = createApp();
    const app2 = createApp();
    const handler = vi.fn();

    app1.on("shared:event", handler);
    app2.emit("shared:event", "from app2");

    expect(handler).not.toHaveBeenCalled();
  });

  it("plugin installed in one app is not visible in another", () => {
    const plugin: NamespacePlugin<void> = { id: "shared-plugin", install: vi.fn() };
    const app1 = createApp();
    const app2 = createApp();

    app1.use(plugin);
    expect(app1.installed("shared-plugin")).toBe(true);
    expect(app2.installed("shared-plugin")).toBe(false);
  });
});
