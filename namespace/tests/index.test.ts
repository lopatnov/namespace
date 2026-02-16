import { describe, expect, it, vi } from "vitest";
import {
  path,
  clone,
  createNamespace,
  emit,
  entries,
  fromJSON,
  has,
  inject,
  keys,
  merge,
  off,
  on,
  parent,
  provide,
  remove,
  root,
  scope,
  toJSON,
} from "../src/index";

describe("createNamespace", () => {
  it("creates an empty namespace", () => {
    const ns = createNamespace();
    expect(keys(ns)).toEqual([]);
  });
});

describe("provide / inject", () => {
  it("stores and retrieves a value", () => {
    const ns = createNamespace();
    provide(ns, "name", "Alice");
    expect(inject(ns, "name")).toBe("Alice");
  });

  it("handles falsy values correctly (0, empty string, false, null)", () => {
    const ns = createNamespace();
    provide(ns, "zero", 0);
    provide(ns, "empty", "");
    provide(ns, "no", false);
    provide(ns, "nil", null);

    expect(inject(ns, "zero")).toBe(0);
    expect(inject(ns, "empty")).toBe("");
    expect(inject(ns, "no")).toBe(false);
    expect(inject(ns, "nil")).toBe(null);

    expect(has(ns, "zero")).toBe(true);
    expect(has(ns, "empty")).toBe(true);
    expect(has(ns, "no")).toBe(true);
    expect(has(ns, "nil")).toBe(true);
  });

  it("returns undefined for non-existent key", () => {
    const ns = createNamespace();
    expect(inject(ns, "nope")).toBeUndefined();
  });

  it("overwrites existing value", () => {
    const ns = createNamespace();
    provide(ns, "x", 1);
    provide(ns, "x", 2);
    expect(inject(ns, "x")).toBe(2);
  });

  it("supports dot-path for deep provide/inject", () => {
    const ns = createNamespace();
    provide(ns, "config.db.host", "localhost");
    provide(ns, "config.db.port", 5432);

    expect(inject(ns, "config.db.host")).toBe("localhost");
    expect(inject(ns, "config.db.port")).toBe(5432);
  });

  it("stores functions", () => {
    const ns = createNamespace();
    const fn = (x: number) => x * 2;
    provide(ns, "double", fn);
    const result = inject<(x: number) => number>(ns, "double");
    expect(result!(3)).toBe(6);
  });

  it("stores objects and arrays", () => {
    const ns = createNamespace();
    provide(ns, "list", [1, 2, 3]);
    provide(ns, "obj", { a: 1 });

    expect(inject(ns, "list")).toEqual([1, 2, 3]);
    expect(inject(ns, "obj")).toEqual({ a: 1 });
  });
});

describe("has", () => {
  it("returns true for existing key", () => {
    const ns = createNamespace();
    provide(ns, "x", 42);
    expect(has(ns, "x")).toBe(true);
  });

  it("returns false for non-existent key", () => {
    const ns = createNamespace();
    expect(has(ns, "x")).toBe(false);
  });

  it("works with dot-paths", () => {
    const ns = createNamespace();
    provide(ns, "a.b.c", 1);
    expect(has(ns, "a.b.c")).toBe(true);
    expect(has(ns, "a.b")).toBe(true);
    expect(has(ns, "a.b.d")).toBe(false);
    expect(has(ns, "a.z")).toBe(false);
  });
});

describe("remove", () => {
  it("removes a key", () => {
    const ns = createNamespace();
    provide(ns, "x", 42);
    expect(remove(ns, "x")).toBe(true);
    expect(has(ns, "x")).toBe(false);
    expect(inject(ns, "x")).toBeUndefined();
  });

  it("returns false for non-existent key", () => {
    const ns = createNamespace();
    expect(remove(ns, "x")).toBe(false);
  });

  it("removes deep paths", () => {
    const ns = createNamespace();
    provide(ns, "a.b.c", 1);
    expect(remove(ns, "a.b.c")).toBe(true);
    expect(has(ns, "a.b.c")).toBe(false);
    expect(has(ns, "a.b")).toBe(true); // parent remains
  });
});

describe("keys / entries", () => {
  it("lists immediate child keys", () => {
    const ns = createNamespace();
    provide(ns, "a", 1);
    provide(ns, "b", 2);
    provide(ns, "c.d", 3);
    expect(keys(ns).sort()).toEqual(["a", "b", "c"]);
  });

  it("returns entries", () => {
    const ns = createNamespace();
    provide(ns, "x", 10);
    provide(ns, "y", 20);
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
    provide(auth, "user", "Admin");

    expect(inject(ns, "auth.user")).toBe("Admin");
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
    provide(db, "host", "localhost");

    expect(inject(ns, "config.db.host")).toBe("localhost");
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

  it("provide emits 'change' event", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    on(ns, "change", handler);

    provide(ns, "x", 42);
    expect(handler).toHaveBeenCalledWith("x", 42, undefined);

    provide(ns, "x", 100);
    expect(handler).toHaveBeenCalledWith("x", 100, 42);
  });

  it("change events bubble up from child scopes", () => {
    const ns = createNamespace();
    const rootHandler = vi.fn();
    on(ns, "change", rootHandler);

    provide(ns, "auth.user", "Admin");
    expect(rootHandler).toHaveBeenCalledWith("auth.user", "Admin", undefined);
  });

  it("remove emits 'delete' event", () => {
    const ns = createNamespace();
    const handler = vi.fn();
    on(ns, "delete", handler);

    provide(ns, "x", 42);
    remove(ns, "x");
    expect(handler).toHaveBeenCalledWith("x");
  });
});

describe("toJSON / fromJSON / clone", () => {
  it("serializes namespace to plain object", () => {
    const ns = createNamespace();
    provide(ns, "name", "App");
    provide(ns, "config.db.host", "localhost");
    provide(ns, "config.db.port", 5432);

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
    provide(ns, "name", "App");
    provide(ns, "fn", () => 42);

    const json = toJSON(ns);
    expect(json).toEqual({ name: "App" });
  });

  it("deserializes plain object to namespace", () => {
    const data = {
      name: "App",
      config: { db: { host: "localhost", port: 5432 } },
    };
    const ns = fromJSON(data);

    expect(inject(ns, "name")).toBe("App");
    expect(inject(ns, "config.db.host")).toBe("localhost");
    expect(inject(ns, "config.db.port")).toBe(5432);
  });

  it("clone creates independent copy", () => {
    const ns = createNamespace();
    provide(ns, "x", 1);
    provide(ns, "a.b", 2);

    const copy = clone(ns);
    provide(copy, "x", 999);

    expect(inject(ns, "x")).toBe(1); // original unchanged
    expect(inject(copy, "x")).toBe(999);
  });
});

describe("merge", () => {
  it("merges plain object into namespace", () => {
    const ns = createNamespace();
    provide(ns, "x", 1);

    merge(ns, { y: 2, nested: { a: 3 } });

    expect(inject(ns, "x")).toBe(1);
    expect(inject(ns, "y")).toBe(2);
    expect(inject(ns, "nested.a")).toBe(3);
  });
});

describe("edge cases", () => {
  it("throws on empty path", () => {
    const ns = createNamespace();
    expect(() => provide(ns, "", 1)).toThrow();
  });

  it("throws on path with double dots", () => {
    const ns = createNamespace();
    expect(() => provide(ns, "a..b", 1)).toThrow();
  });

  it("handles many nested levels", () => {
    const ns = createNamespace();
    provide(ns, "a.b.c.d.e.f.g", "deep");
    expect(inject(ns, "a.b.c.d.e.f.g")).toBe("deep");
  });

  it("provide overwrites non-namespace with namespace (scope re-creation)", () => {
    const ns = createNamespace();
    provide(ns, "x", 42);
    // Now provide a deep path through x — x becomes a namespace
    provide(ns, "x.y", 1);
    expect(inject(ns, "x.y")).toBe(1);
  });
});
