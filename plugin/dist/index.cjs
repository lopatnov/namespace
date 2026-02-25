Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let _lopatnov_namespace = require("@lopatnov/namespace");

//#region src/index.ts
const _registry = /* @__PURE__ */ new WeakMap();
function getRegistry(ns) {
	let map = _registry.get(ns);
	if (!map) {
		map = /* @__PURE__ */ new Map();
		_registry.set(ns, map);
	}
	return map;
}
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
function definePlugin(plugin) {
	return plugin;
}
/**
* Install a plugin on a namespace. Idempotent — calling multiple times
* with the same plugin has no effect after the first install.
*
* Emits `plugin:installed` event on success.
*/
function usePlugin(ns, plugin, ...args) {
	const registry = getRegistry(ns);
	if (registry.has(plugin.id)) return;
	const opts = args[0];
	plugin.install(ns, opts);
	registry.set(plugin.id, plugin);
	(0, _lopatnov_namespace.emit)(ns, "plugin:installed", plugin.id);
}
/**
* Check if a plugin is installed on a namespace.
* Accepts a plugin object or an id string.
*/
function installed(ns, plugin) {
	const id = typeof plugin === "string" ? plugin : plugin.id;
	return getRegistry(ns).has(id);
}
/**
* Uninstall a plugin from a namespace.
* Calls `plugin.uninstall()` if defined, then emits `plugin:uninstalled`.
* Accepts a plugin object or an id string.
*/
function uninstallPlugin(ns, plugin) {
	const id = typeof plugin === "string" ? plugin : plugin.id;
	const registry = getRegistry(ns);
	const p = registry.get(id);
	if (!p) return;
	p.uninstall?.(ns);
	registry.delete(id);
	(0, _lopatnov_namespace.emit)(ns, "plugin:uninstalled", id);
}

//#endregion
exports.definePlugin = definePlugin;
exports.installed = installed;
exports.uninstallPlugin = uninstallPlugin;
exports.usePlugin = usePlugin;