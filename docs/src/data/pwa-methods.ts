import type { MethodGroup } from "./namespace-methods.ts";

export const pwaMethods: MethodGroup[] = [
  {
    slug: "registerSW",
    title: "registerSW",
    methods: [
      {
        name: "registerSW",
        signature:
          "registerSW(url: string, options?: RegisterSWOptions): Promise<ServiceWorkerRegistration | undefined>",
        description:
          "Register a Service Worker at `url`. Returns a Promise that resolves to the registration, or `undefined` if Service Workers are not supported. Accepts optional `onSuccess` and `onError` callbacks.",
        example: `import { registerSW } from '@lopatnov/namespace-pwa';

const reg = await registerSW('/sw.js', {
  onSuccess(registration) {
    console.log('SW registered:', registration.scope);
  },
  onError(err) {
    console.error('SW registration failed:', err);
  },
});`,
      },
    ],
  },
  {
    slug: "install-prompt",
    title: "onInstallPrompt / promptInstall",
    methods: [
      {
        name: "onInstallPrompt",
        signature: "onInstallPrompt(cb: (e: BeforeInstallPromptEvent) => void): () => void",
        description:
          "Subscribe to the `beforeinstallprompt` event. If the event has already fired when you subscribe, the callback is called immediately with the cached event. Returns a cleanup function that removes the subscription.",
        example: `import { onInstallPrompt } from '@lopatnov/namespace-pwa';

const stop = onInstallPrompt(() => {
  // Show your custom "Install App" button
  document.getElementById('install-btn').style.display = 'block';
});

// Later — remove listener
stop();`,
      },
      {
        name: "promptInstall",
        signature: "promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'>",
        description:
          "Trigger the native browser install dialog. Returns a Promise that resolves to `'accepted'` if the user installed the app, `'dismissed'` if they declined, or `'unavailable'` if no install prompt is available (already installed, or browser doesn't support it).",
        example: `import { promptInstall } from '@lopatnov/namespace-pwa';

document.getElementById('install-btn').addEventListener('click', async () => {
  const outcome = await promptInstall();
  if (outcome === 'accepted') {
    console.log('App installed!');
  } else if (outcome === 'dismissed') {
    console.log('User dismissed the prompt.');
  }
});`,
      },
    ],
  },
  {
    slug: "network-status",
    title: "isOnline / onOffline / onOnline",
    methods: [
      {
        name: "isOnline",
        signature: "isOnline(): boolean",
        description:
          "Returns `true` if the browser is currently online (`navigator.onLine`). Safe to call in SSR — returns `true` when `navigator` is not available.",
        example: `import { isOnline } from '@lopatnov/namespace-pwa';

if (!isOnline()) {
  showOfflineBanner();
}`,
      },
      {
        name: "onOffline",
        signature: "onOffline(cb: () => void): () => void",
        description: "Subscribe to the browser `offline` event. Returns a cleanup function.",
        example: `import { onOffline, onOnline } from '@lopatnov/namespace-pwa';

const stopOffline = onOffline(() => {
  document.getElementById('status').textContent = '⚠ Offline';
});

const stopOnline = onOnline(() => {
  document.getElementById('status').textContent = '✓ Online';
});

// Cleanup
stopOffline();
stopOnline();`,
      },
      {
        name: "onOnline",
        signature: "onOnline(cb: () => void): () => void",
        description: "Subscribe to the browser `online` event. Returns a cleanup function.",
        example: `import { onOnline } from '@lopatnov/namespace-pwa';

onOnline(() => {
  syncPendingData();
});`,
      },
    ],
  },
  {
    slug: "sw-updates",
    title: "onUpdateAvailable / activateUpdate",
    methods: [
      {
        name: "onUpdateAvailable",
        signature:
          "onUpdateAvailable(reg: ServiceWorkerRegistration, cb: (reg: ServiceWorkerRegistration) => void): () => void",
        description:
          "Watch a ServiceWorkerRegistration for a new version. Calls `cb(registration)` when a new Service Worker has finished installing and is waiting to take control. Returns a cleanup function.",
        example: `import { registerSW, onUpdateAvailable, activateUpdate } from '@lopatnov/namespace-pwa';

const reg = await registerSW('/sw.js');
if (reg) {
  onUpdateAvailable(reg, (r) => {
    // Show "New version available" banner
    const btn = document.getElementById('update-btn');
    btn.style.display = 'block';
    btn.onclick = () => activateUpdate(r);
  });
}`,
      },
      {
        name: "activateUpdate",
        signature: "activateUpdate(reg: ServiceWorkerRegistration): void",
        description:
          "Tell the waiting Service Worker to skip waiting and become active. Posts a `SKIP_WAITING` message to the waiting worker, then reloads the page once it takes control. The Service Worker must handle `self.addEventListener('message', e => { if (e.data.type === 'SKIP_WAITING') self.skipWaiting(); })`.",
        example: `// In your Service Worker (sw.js):
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// In your app:
import { activateUpdate } from '@lopatnov/namespace-pwa';
activateUpdate(registration); // reloads after SW takes control`,
      },
    ],
  },
];
