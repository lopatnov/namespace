# @lopatnov/namespace-pwa

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-pwa)](https://www.npmjs.com/package/@lopatnov/namespace-pwa)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-pwa)](LICENSE)

PWA utilities for `@lopatnov/namespace`. Service Worker registration, install prompt, network status detection, and SW update management.

## Install

```sh
npm install @lopatnov/namespace-pwa
```

## Quick start

```ts
import {
  registerSW,
  onInstallPrompt,
  promptInstall,
  isOnline,
  onOffline,
  onOnline,
  onUpdateAvailable,
  activateUpdate,
} from '@lopatnov/namespace-pwa';

// Register Service Worker
registerSW('./sw.js');

// Detect network state
onOffline(() => document.getElementById('banner').hidden = false);
onOnline(() => document.getElementById('banner').hidden = true);

// Install prompt
onInstallPrompt(() => {
  document.getElementById('install-btn').hidden = false;
});
document.getElementById('install-btn').onclick = () => promptInstall();

// SW updates
onUpdateAvailable((reg) => {
  if (confirm('New version available. Reload?')) activateUpdate(reg);
});
```

## API

### Service Worker

| Function | Description |
|----------|-------------|
| `registerSW(url, options?)` | Register a Service Worker. Returns `Promise<ServiceWorkerRegistration \| undefined>` |

`RegisterSWOptions`: `onSuccess(reg)`, `onError(err)`.

### Install prompt

| Function | Description |
|----------|-------------|
| `onInstallPrompt(cb)` | Subscribe to `beforeinstallprompt`. Returns unsubscribe function |
| `promptInstall()` | Show the native install prompt. Returns `Promise<InstallOutcome>` |

`InstallOutcome`: `"accepted"` \| `"dismissed"` \| `"unavailable"`.

### Network status

| Function | Description |
|----------|-------------|
| `isOnline()` | Returns current `navigator.onLine` |
| `onOffline(cb)` | Subscribe to going offline. Returns unsubscribe function |
| `onOnline(cb)` | Subscribe to coming back online. Returns unsubscribe function |

### SW updates

| Function | Description |
|----------|-------------|
| `onUpdateAvailable(cb)` | Called when a new SW is waiting to activate. Returns unsubscribe function |
| `activateUpdate(reg)` | Send `SKIP_WAITING` message to the waiting SW |

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
