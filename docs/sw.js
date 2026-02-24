// @lopatnov/namespace docs — Service Worker
// Caches the app shell for offline access.

const CACHE = "ns-docs-v1";
const PRECACHE = ["./", "./index.html", "./dist/app.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Remove old caches from previous versions
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Network-first for API calls, cache-first for static assets
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/")) {
    return; // let API requests pass through (no caching)
  }
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
