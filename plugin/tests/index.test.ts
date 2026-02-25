import type { Namespace, NamespacePlugin } from "@lopatnov/namespace";
import { createNamespace, inject, on, provide } from "@lopatnov/namespace";
import { describe, expect, it, vi } from "vitest";
import { definePlugin, installed, uninstallPlugin, usePlugin } from "../src/index";

describe("definePlugin", () => {
  it("returns the same plugin object (identity function)", () => {
    const plugin: NamespacePlugin<void> = { id: "test", install: vi.fn() };
    expect(definePlugin(plugin)).toBe(plugin);
  });

  it("infers typed options through definePlugin", () => {
    const plugin = definePlugin({
      id: "typed",
      install(ns: Namespace, opts: { url: string }) {
        provide(ns, "url", opts.url);
      },
    });
    const ns = createNamespace();
    usePlugin(ns, plugin, { url: "https://example.com" });
    expect(inject(ns, "url")).toBe("https://example.com");
  });
});

describe("usePlugin", () => {
  it("installs a void plugin", () => {
    const installFn = vi.fn();
    const plugin = definePlugin({ id: "simple", install: installFn });
    const ns = createNamespace();

    usePlugin(ns, plugin);
    expect(installFn).toHaveBeenCalledWith(ns, undefined);
  });

  it("installs a plugin with options", () => {
    const plugin = definePlugin({
      id: "opts-plugin",
      install(ns: Namespace, opts: { key: string; value: number }) {
        provide(ns, opts.key, opts.value);
      },
    });

    const ns = createNamespace();
    usePlugin(ns, plugin, { key: "answer", value: 42 });
    expect(inject(ns, "answer")).toBe(42);
  });

  it("is idempotent — install called only once", () => {
    const installFn = vi.fn();
    const plugin = definePlugin({ id: "once", install: installFn });
    const ns = createNamespace();

    usePlugin(ns, plugin);
    usePlugin(ns, plugin);
    usePlugin(ns, plugin);

    expect(installFn).toHaveBeenCalledTimes(1);
  });

  it("emits plugin:installed event", () => {
    const handler = vi.fn();
    const plugin = definePlugin({ id: "evt", install: vi.fn() });
    const ns = createNamespace();

    on(ns, "plugin:installed", handler);
    usePlugin(ns, plugin);

    expect(handler).toHaveBeenCalledWith("evt");
  });

  it("does not emit plugin:installed on subsequent calls", () => {
    const handler = vi.fn();
    const plugin = definePlugin({ id: "no-dup-evt", install: vi.fn() });
    const ns = createNamespace();

    on(ns, "plugin:installed", handler);
    usePlugin(ns, plugin);
    usePlugin(ns, plugin);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("installed", () => {
  it("returns false before install", () => {
    const plugin = definePlugin({ id: "check", install: vi.fn() });
    const ns = createNamespace();
    expect(installed(ns, plugin)).toBe(false);
    expect(installed(ns, "check")).toBe(false);
  });

  it("returns true after install (by plugin object)", () => {
    const plugin = definePlugin({ id: "check2", install: vi.fn() });
    const ns = createNamespace();
    usePlugin(ns, plugin);
    expect(installed(ns, plugin)).toBe(true);
  });

  it("returns true after install (by string id)", () => {
    const plugin = definePlugin({ id: "check3", install: vi.fn() });
    const ns = createNamespace();
    usePlugin(ns, plugin);
    expect(installed(ns, "check3")).toBe(true);
  });

  it("is independent between namespaces", () => {
    const plugin = definePlugin({ id: "iso", install: vi.fn() });
    const ns1 = createNamespace();
    const ns2 = createNamespace();

    usePlugin(ns1, plugin);
    expect(installed(ns1, plugin)).toBe(true);
    expect(installed(ns2, plugin)).toBe(false);
  });
});

describe("uninstallPlugin", () => {
  it("calls uninstall and marks as not installed", () => {
    const uninstallFn = vi.fn();
    const plugin = definePlugin({ id: "removable", install: vi.fn(), uninstall: uninstallFn });
    const ns = createNamespace();

    usePlugin(ns, plugin);
    uninstallPlugin(ns, plugin);

    expect(uninstallFn).toHaveBeenCalledWith(ns);
    expect(installed(ns, plugin)).toBe(false);
  });

  it("uninstalls by string id", () => {
    const uninstallFn = vi.fn();
    const plugin = definePlugin({ id: "by-id", install: vi.fn(), uninstall: uninstallFn });
    const ns = createNamespace();

    usePlugin(ns, plugin);
    uninstallPlugin(ns, "by-id");

    expect(uninstallFn).toHaveBeenCalled();
    expect(installed(ns, "by-id")).toBe(false);
  });

  it("emits plugin:uninstalled event", () => {
    const handler = vi.fn();
    const plugin = definePlugin({ id: "emit-uninstall", install: vi.fn() });
    const ns = createNamespace();

    on(ns, "plugin:uninstalled", handler);
    usePlugin(ns, plugin);
    uninstallPlugin(ns, plugin);

    expect(handler).toHaveBeenCalledWith("emit-uninstall");
  });

  it("is a no-op if plugin was never installed", () => {
    const plugin = definePlugin({ id: "ghost", install: vi.fn() });
    const ns = createNamespace();
    expect(() => uninstallPlugin(ns, plugin)).not.toThrow();
  });

  it("allows re-install after uninstall", () => {
    const installFn = vi.fn();
    const plugin = definePlugin({ id: "reinstall", install: installFn });
    const ns = createNamespace();

    usePlugin(ns, plugin);
    uninstallPlugin(ns, plugin);
    usePlugin(ns, plugin);

    expect(installFn).toHaveBeenCalledTimes(2);
    expect(installed(ns, plugin)).toBe(true);
  });
});
