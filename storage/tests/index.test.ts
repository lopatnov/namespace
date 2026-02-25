import { createNamespace, inject, provide } from "@lopatnov/namespace";
import { describe, expect, it, vi } from "vitest";
import type { StorageAdapter } from "../src/index";
import { createIndexedDB, persist, restore } from "../src/index";

// --- Helpers ---

function makeMemoryStorage(): StorageAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

// --- Tests: persist ---

describe("persist", () => {
  it("saves a key to storage on change", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    persist(ns, { keys: ["user"], storage });

    provide(ns, "user", { name: "Alice" });

    await vi.waitFor(() => {
      expect(storage.store.has("ns:user")).toBe(true);
    });

    const stored = JSON.parse(storage.store.get("ns:user")!);
    expect(stored).toEqual({ name: "Alice" });
  });

  it("saves dot-path sub-key changes under the root key", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    persist(ns, { keys: ["config"], storage });

    provide(ns, "config.apiUrl", "/api/v2");

    await vi.waitFor(() => {
      expect(storage.store.has("ns:config")).toBe(true);
    });

    const stored = JSON.parse(storage.store.get("ns:config")!);
    expect(stored).toMatchObject({ apiUrl: "/api/v2" });
  });

  it("removes key from storage when namespace key is deleted", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    provide(ns, "user", "Alice");
    persist(ns, { keys: ["user"], storage });

    provide(ns, "user", "Alice");
    await vi.waitFor(() => expect(storage.store.has("ns:user")).toBe(true));

    // Simulate deletion by setting undefined — actually remove
    const { remove } = await import("@lopatnov/namespace");
    remove(ns, "user");

    await vi.waitFor(() => {
      expect(storage.store.has("ns:user")).toBe(false);
    });
  });

  it("uses custom prefix", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    persist(ns, { keys: ["x"], storage, prefix: "app:" });

    provide(ns, "x", 42);

    await vi.waitFor(() => {
      expect(storage.store.has("app:x")).toBe(true);
    });
  });

  it("does not save untracked keys", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    persist(ns, { keys: ["a"], storage });
    provide(ns, "b", "ignored");

    // Wait a bit to ensure no spurious saves
    await new Promise((r) => setTimeout(r, 10));
    expect(storage.store.size).toBe(0);
  });

  it("cleanup stops saving", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    const stop = persist(ns, { keys: ["x"], storage });
    stop();

    provide(ns, "x", "after-stop");
    await new Promise((r) => setTimeout(r, 10));

    expect(storage.store.size).toBe(0);
  });

  it("debounces rapid saves", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();
    const spy = vi.spyOn(storage, "setItem");

    persist(ns, { keys: ["x"], storage, debounce: 50 });

    provide(ns, "x", 1);
    provide(ns, "x", 2);
    provide(ns, "x", 3);

    await new Promise((r) => setTimeout(r, 100));

    // Only one write despite three rapid changes
    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.store.get("ns:x")!)).toBe(3);
  });
});

// --- Tests: restore ---

describe("restore", () => {
  it("restores a plain value from storage", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();
    storage.store.set("ns:name", JSON.stringify("Alice"));

    await restore(ns, { keys: ["name"], storage });

    expect(inject(ns, "name")).toBe("Alice");
  });

  it("restores a nested object as namespace keys", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();
    storage.store.set("ns:config", JSON.stringify({ apiUrl: "/api/v1", debug: true }));

    await restore(ns, { keys: ["config"], storage });

    expect(inject(ns, "config.apiUrl")).toBe("/api/v1");
    expect(inject(ns, "config.debug")).toBe(true);
  });

  it("ignores missing keys", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();

    // Should not throw
    await restore(ns, { keys: ["missing"], storage });
    expect(inject(ns, "missing")).toBeUndefined();
  });

  it("uses custom prefix", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();
    storage.store.set("app:x", JSON.stringify(99));

    await restore(ns, { keys: ["x"], storage, prefix: "app:" });

    expect(inject(ns, "x")).toBe(99);
  });

  it("ignores corrupted JSON", async () => {
    const ns = createNamespace();
    const storage = makeMemoryStorage();
    storage.store.set("ns:bad", "not-json{{");

    await expect(restore(ns, { keys: ["bad"], storage })).resolves.toBeUndefined();
    expect(inject(ns, "bad")).toBeUndefined();
  });
});

// --- Tests: createIndexedDB ---

describe("createIndexedDB", () => {
  it("falls back to in-memory when indexedDB is unavailable", async () => {
    const adapter = createIndexedDB("test-db");

    await adapter.setItem("key1", "value1");
    expect(await adapter.getItem("key1")).toBe("value1");

    await adapter.removeItem("key1");
    expect(await adapter.getItem("key1")).toBeNull();
  });
});
