# @lopatnov/namespace-plugin

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-plugin)](https://www.npmjs.com/package/@lopatnov/namespace-plugin)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-plugin)](LICENSE)

Plugin system for `@lopatnov/namespace` pure-function users. Defines, installs, queries, and uninstalls plugins on a namespace — without `createApp`.

> If you use `createApp()`, the plugin system is built-in via `app.use(plugin)`. This package is for developers using the tree-shakeable functions directly.

## Install

```sh
npm install @lopatnov/namespace @lopatnov/namespace-plugin
```

## Quick start

```ts
import { createNamespace } from '@lopatnov/namespace';
import { definePlugin, usePlugin, installed, uninstallPlugin } from '@lopatnov/namespace-plugin';

// Define a plugin
const LogPlugin = definePlugin({
  id: 'log',
  install(ns) {
    set(ns, 'logger', console);
  },
  uninstall(ns) {
    remove(ns, 'logger');
  },
});

const ns = createNamespace();
usePlugin(ns, LogPlugin);          // install (idempotent)
installed(ns, LogPlugin);          // true
installed(ns, 'log');             // true — check by id string
uninstallPlugin(ns, LogPlugin);    // uninstall (calls plugin.uninstall if defined)
```

## API

| Function | Description |
|----------|-------------|
| `definePlugin(options)` | Identity helper for TypeScript inference; zero runtime cost |
| `usePlugin(ns, plugin, options?)` | Install a plugin. Idempotent — safe to call multiple times |
| `installed(ns, plugin \| id)` | Check if a plugin is installed |
| `uninstallPlugin(ns, plugin \| id)` | Uninstall and call `plugin.uninstall(ns)` if defined |

### Plugin contract

```ts
interface NamespacePlugin<TOptions = void> {
  readonly id: string;
  install(ns: Namespace, options: TOptions): void;
  uninstall?(ns: Namespace): void;
}
```

### Events emitted on install / uninstall

- `plugin:installed` — `{ id, plugin }`
- `plugin:uninstalled` — `{ id, plugin }`

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
