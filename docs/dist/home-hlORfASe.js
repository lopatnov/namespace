//#region src/pages/home.html
var home_default = "<div class=\"py-4\">\r\n  <h1 class=\"display-5 fw-bold mb-3\">@lopatnov/namespace</h1>\r\n  <p class=\"lead text-body-secondary\">\r\n    Modular ecosystem for structured jQuery applications.<br />\r\n    Tree-shakeable pure functions. ES2024. Zero dependencies.\r\n  </p>\r\n  <hr class=\"my-4\" />\r\n\r\n  <h4 class=\"mb-3\">Ecosystem</h4>\r\n  <div class=\"row g-3 mb-5\" id=\"package-cards\"></div>\r\n\r\n  <h4 class=\"mb-3\">Quick Start</h4>\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code id=\"quick-example\"></code></pre>\r\n</div>\r\n";

//#endregion
//#region src/pages/home.ts
const packages = [
	{
		icon: "bi-box-seam",
		name: "Namespace",
		npm: "@lopatnov/namespace",
		description: "Service registry, event bus, DI, scoped namespaces. Foundation for everything.",
		href: "/namespace",
		color: "primary"
	},
	{
		icon: "bi-signpost-split",
		name: "Router",
		npm: "@lopatnov/namespace-router",
		description: "SPA routing with lazy loading, route params, hash & history modes.",
		href: "/router",
		color: "success"
	},
	{
		icon: "bi-puzzle",
		name: "Plugin",
		npm: "@lopatnov/namespace-plugin",
		description: "Extensible plugin system. Install, uninstall, and query plugins at runtime.",
		href: "/plugin",
		color: "info"
	},
	{
		icon: "bi-archive",
		name: "Storage",
		npm: "@lopatnov/namespace-storage",
		description: "Persist namespace state to localStorage, sessionStorage or IndexedDB.",
		href: "/storage",
		color: "warning"
	},
	{
		icon: "bi-shield-check",
		name: "Guards",
		npm: "@lopatnov/namespace-guards",
		description: "Route guards and namespace access checks. Intercept navigation with predicates.",
		href: "/guards",
		color: "danger"
	},
	{
		icon: "bi-lightning-charge",
		name: "MVVM",
		npm: "@lopatnov/namespace-mvvm",
		description: "Reactive data-bind for DOM via ES2024 Proxy. Knockout.js-style bindings.",
		href: "/mvvm",
		color: "secondary"
	},
	{
		icon: "bi-phone",
		name: "PWA",
		npm: "@lopatnov/namespace-pwa",
		description: "Service Worker registration, install prompt, network status, SW updates.",
		href: "/pwa",
		color: "dark"
	},
	{
		icon: "bi-layers",
		name: "Component",
		npm: "@lopatnov/namespace-component",
		description: "Reusable components: template + scoped CSS + reactive state + lifecycle hooks.",
		href: "/component",
		color: "primary"
	},
	{
		icon: "bi-broadcast",
		name: "Microfrontends",
		npm: "@lopatnov/namespace-microfrontends",
		description: "Cross-tab event bus (BroadcastChannel) and leader election via localStorage heartbeat.",
		href: "/microfrontends",
		color: "success"
	}
];
const quickExample = `import { createApp } from '@lopatnov/namespace';
import { createRouter, route, lazyRoute, start } from '@lopatnov/namespace-router';
import { reactive, bind } from '@lopatnov/namespace-mvvm';
import { persist, restore } from '@lopatnov/namespace-storage';

// 1. App + router
const app = createApp();
const router = createRouter(app.ns, { mode: 'hash', root: '#app' });
route(router, '/', lazyRoute(() => import('./pages/home')));

// 2. Reactive state
const state = reactive({ user: null, theme: 'light' });
bind(state, 'body');

// 3. Persistent storage
persist(app.ns, { keys: ['user'], storage: localStorage });
await restore(app.ns, { storage: localStorage });

start(router);`;
function home(container) {
	container.innerHTML = home_default;
	const cards = packages.map((p) => `
    <div class="col-md-6 col-lg-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title"><i class="bi ${p.icon} me-2 text-${p.color}"></i>${p.name}</h6>
          <p class="card-text small text-muted">${p.description}</p>
          <a href="${p.href}" data-nav class="btn btn-outline-${p.color} btn-sm">Explore</a>
        </div>
      </div>
    </div>`).join("");
	$("#package-cards").html(cards);
	$("#quick-example").text(quickExample);
}

//#endregion
export { home as default };