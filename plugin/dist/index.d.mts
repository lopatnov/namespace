import { Namespace, NamespacePlugin } from "@lopatnov/namespace";

//#region src/index.d.ts
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
declare function definePlugin<TOptions = void>(plugin: NamespacePlugin<TOptions>): NamespacePlugin<TOptions>;
/**
 * Install a plugin on a namespace. Idempotent — calling multiple times
 * with the same plugin has no effect after the first install.
 *
 * Emits `plugin:installed` event on success.
 */
declare function usePlugin<TOptions>(ns: Namespace, plugin: NamespacePlugin<TOptions>, ...args: TOptions extends void ? [] : [TOptions]): void;
/**
 * Check if a plugin is installed on a namespace.
 * Accepts a plugin object or an id string.
 */
declare function installed(ns: Namespace, plugin: NamespacePlugin<any> | string): boolean;
/**
 * Uninstall a plugin from a namespace.
 * Calls `plugin.uninstall()` if defined, then emits `plugin:uninstalled`.
 * Accepts a plugin object or an id string.
 */
declare function uninstallPlugin(ns: Namespace, plugin: NamespacePlugin<any> | string): void;
//#endregion
export { definePlugin, installed, uninstallPlugin, usePlugin };