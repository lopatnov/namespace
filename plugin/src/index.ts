// ============================================================
// @lopatnov/namespace-plugin
// Plugin system for @lopatnov/namespace pure-function users.
//
// For App-based usage, plugins are built into the App class
// via app.use(plugin). This module targets developers who use
// the tree-shakeable pure functions directly (no createApp).
// ============================================================

import type { Namespace, NamespacePlugin } from "@lopatnov/namespace";
import { emit } from "@lopatnov/namespace";

// --- Internal plugin registry ---
// Stored in a WeakMap so it doesn't pollute keys(ns) and is GC-safe.

const _registry = new WeakMap<Namespace, Map<string, NamespacePlugin<any>>>();

function getRegistry(ns: Namespace): Map<string, NamespacePlugin<any>> {
  let map = _registry.get(ns);
  if (!map) {
    map = new Map();
    _registry.set(ns, map);
  }
  return map;
}

// --- Public API ---

/**
 * Define a plugin. This is an identity function used for TypeScript
 * inference — it has zero runtime overhead.
 *
 * @example
 * const LogPlugin = definePlugin({
 *   id: 'log',
 *   install(ns) { set(ns, 'logger', console); }
 * });
 */
export function definePlugin<TOptions = void>(
  plugin: NamespacePlugin<TOptions>,
): NamespacePlugin<TOptions> {
  return plugin;
}

/**
 * Install a plugin on a namespace. Idempotent — calling multiple times
 * with the same plugin has no effect after the first install.
 *
 * Emits `plugin:installed` event on success.
 */
export function usePlugin<TOptions>(
  ns: Namespace,
  plugin: NamespacePlugin<TOptions>,
  ...args: TOptions extends void ? [] : [TOptions]
): void {
  const registry = getRegistry(ns);
  if (registry.has(plugin.id)) return;

  const opts = args[0] as TOptions;
  plugin.install(ns, opts);
  registry.set(plugin.id, plugin);
  emit(ns, "plugin:installed", plugin.id);
}

/**
 * Check if a plugin is installed on a namespace.
 * Accepts a plugin object or an id string.
 */
export function installed(ns: Namespace, plugin: NamespacePlugin<any> | string): boolean {
  const id = typeof plugin === "string" ? plugin : plugin.id;
  return getRegistry(ns).has(id);
}

/**
 * Uninstall a plugin from a namespace.
 * Calls `plugin.uninstall()` if defined, then emits `plugin:uninstalled`.
 * Accepts a plugin object or an id string.
 */
export function uninstallPlugin(ns: Namespace, plugin: NamespacePlugin<any> | string): void {
  const id = typeof plugin === "string" ? plugin : plugin.id;
  const registry = getRegistry(ns);
  const p = registry.get(id);
  if (!p) return;

  p.uninstall?.(ns);
  registry.delete(id);
  emit(ns, "plugin:uninstalled", id);
}
