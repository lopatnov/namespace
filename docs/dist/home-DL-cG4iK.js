//#region src/pages/home.html
var home_default = "<div class=\"py-4\">\r\n  <h1 class=\"display-5 fw-bold mb-3\">@lopatnov/namespace</h1>\r\n  <p class=\"lead text-body-secondary\">\r\n    Lightweight modular namespace ecosystem for structured applications.<br />\r\n    Tree-shakeable pure functions. ES2024. Zero dependencies.\r\n  </p>\r\n  <hr class=\"my-4\" />\r\n\r\n  <div class=\"row g-4 mb-5\">\r\n    <div class=\"col-md-6\">\r\n      <div class=\"card h-100 border-primary\">\r\n        <div class=\"card-body\">\r\n          <h5 class=\"card-title\"><i class=\"bi bi-box-seam me-2\"></i>Namespace (Core)</h5>\r\n          <p class=\"card-text\">Service registry, event bus, scoped namespaces. The foundation for everything.</p>\r\n          <a href=\"/namespace\" data-nav class=\"btn btn-outline-primary btn-sm\">Explore API</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-6\">\r\n      <div class=\"card h-100 border-success\">\r\n        <div class=\"card-body\">\r\n          <h5 class=\"card-title\"><i class=\"bi bi-signpost-split me-2\"></i>Router</h5>\r\n          <p class=\"card-text\">SPA routing with lazy loading, route params, hash & history modes.</p>\r\n          <a href=\"/router\" data-nav class=\"btn btn-outline-success btn-sm\">Explore API</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <h4 class=\"mb-3\">Quick Start</h4>\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>npm install @lopatnov/namespace\r\nnpm install @lopatnov/namespace-router</code></pre>\r\n\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code id=\"quick-example\"></code></pre>\r\n\r\n  <h4 class=\"mt-5 mb-3\">Coming Soon</h4>\r\n  <div class=\"row g-3\">\r\n    <div class=\"col-md-4\">\r\n      <div class=\"card text-bg-light\">\r\n        <div class=\"card-body text-center\">\r\n          <h6>MVVM</h6>\r\n          <small class=\"text-muted\">Reactive data-binding</small>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"card text-bg-light\">\r\n        <div class=\"card-body text-center\">\r\n          <h6>Components</h6>\r\n          <small class=\"text-muted\">Reusable UI blocks</small>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"card text-bg-light\">\r\n        <div class=\"card-body text-center\">\r\n          <h6>Plugins</h6>\r\n          <small class=\"text-muted\">Extensible plugin system</small>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";

//#endregion
//#region src/pages/home.ts
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
function home(container) {
	container.innerHTML = home_default;
	$("#quick-example").text(quickExample);
}

//#endregion
export { home as default };