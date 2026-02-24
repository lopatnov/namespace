import template from "./home.html";

const quickExample = `import { createApp } from '@lopatnov/namespace';
import { createRouter, route, lazyRoute, start } from '@lopatnov/namespace-router';

// Create isolated app (perfect for microfrontends)
const app = createApp();

// Set services — chainable fluent API
app
  .use('api.url', '/api/v1')
  .use('auth.token', 'abc123')
  .on('change', (key, val) => console.log(key, val));

// Create SPA router
const router = createRouter(app.ns, { mode: 'hash', root: '#app' });
route(router, '/', lazyRoute(() => import('./pages/home')));
route(router, '/users/:id', lazyRoute(() => import('./pages/user')));
start(router);`;

export default function home(container: Element) {
  container.innerHTML = template;
  $("#quick-example").text(quickExample);
}
