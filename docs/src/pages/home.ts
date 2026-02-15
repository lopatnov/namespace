import template from "./home.html";

const quickExample = `import { createNamespace, provide, inject, on, scope } from '@lopatnov/namespace';
import { createRouter, route, lazyRoute, start } from '@lopatnov/namespace-router';

// Create app namespace
const app = createNamespace();
const auth = scope(app, 'auth');

// Provide services
provide(auth, 'token', 'abc123');

// Listen to changes
on(app, 'change', (key, val) => console.log(key, val));

// Create SPA router
const router = createRouter(app, { mode: 'hash', root: '#app' });
route(router, '/', lazyRoute(() => import('./pages/home')));
route(router, '/users/:id', lazyRoute(() => import('./pages/user')));
start(router);`;

export default function home(container: Element) {
  container.innerHTML = template;
  $("#quick-example").text(quickExample);
}
