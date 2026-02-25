//#region src/data/plugin-methods.ts
const pluginMethods = [{
	slug: "definePlugin",
	title: "definePlugin / usePlugin",
	methods: [{
		name: "definePlugin",
		signature: "definePlugin<TOptions>(plugin: NamespacePlugin<TOptions>): NamespacePlugin<TOptions>",
		description: "Identity function for TypeScript inference. Zero runtime overhead. Wrap your plugin object in `definePlugin` to get full type-checking on `install` / `uninstall` callbacks and options.",
		example: `import { definePlugin } from '@lopatnov/namespace-plugin';
import { set } from '@lopatnov/namespace';

const LogPlugin = definePlugin({
  id: 'log',
  install(ns) {
    set(ns, 'logger', {
      info: (msg: string) => console.log('[INFO]', msg),
      error: (msg: string) => console.error('[ERROR]', msg),
    });
  },
  uninstall(ns) {
    // cleanup if needed
  },
});`
	}, {
		name: "usePlugin",
		signature: "usePlugin<TOptions>(ns: Namespace, plugin: NamespacePlugin<TOptions>, options?: TOptions): void",
		description: "Install a plugin on a namespace. Idempotent — calling multiple times with the same plugin has no effect after the first install. Emits `plugin:installed` event on success. Accepts an optional options argument when `TOptions` is not `void`.",
		example: `import { usePlugin } from '@lopatnov/namespace-plugin';
import { on } from '@lopatnov/namespace';

// Listen for installs
on(app.ns, 'plugin:installed', (id) => console.log('installed:', id));

// Install without options
usePlugin(app.ns, LogPlugin);

// Install with options (typed)
const ThemePlugin = definePlugin<{ dark: boolean }>({
  id: 'theme',
  install(ns, opts) {
    set(ns, 'theme', opts.dark ? 'dark' : 'light');
  },
});
usePlugin(app.ns, ThemePlugin, { dark: true });

// Idempotent — second call is a no-op
usePlugin(app.ns, LogPlugin); // does nothing`
	}]
}, {
	slug: "installed",
	title: "installed / uninstallPlugin",
	methods: [{
		name: "installed",
		signature: "installed(ns: Namespace, plugin: NamespacePlugin | string): boolean",
		description: "Check whether a plugin is currently installed on a namespace. Accepts either a plugin object or a plugin `id` string.",
		example: `import { installed } from '@lopatnov/namespace-plugin';

if (installed(app.ns, LogPlugin)) {
  console.log('Logger is active');
}

// Also works with id string
if (installed(app.ns, 'log')) {
  const logger = get(app.ns, 'logger');
  logger.info('Hello');
}`
	}, {
		name: "uninstallPlugin",
		signature: "uninstallPlugin(ns: Namespace, plugin: NamespacePlugin | string): void",
		description: "Uninstall a plugin from a namespace. Calls `plugin.uninstall(ns)` if defined, then emits `plugin:uninstalled`. Accepts a plugin object or an id string. Safe to call if the plugin is not installed.",
		example: `import { uninstallPlugin } from '@lopatnov/namespace-plugin';
import { on } from '@lopatnov/namespace';

on(app.ns, 'plugin:uninstalled', (id) => console.log('removed:', id));

// Uninstall by plugin object
uninstallPlugin(app.ns, LogPlugin);

// Or by id string
uninstallPlugin(app.ns, 'theme');

// Safe if not installed — no error
uninstallPlugin(app.ns, 'nonexistent');`
	}]
}];

//#endregion
export { pluginMethods as t };