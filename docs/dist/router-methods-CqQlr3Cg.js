//#region src/data/router-methods.ts
const routerMethods = [
	{
		slug: "createRouter",
		title: "createRouter / start / stop",
		methods: [
			{
				name: "createRouter",
				signature: "createRouter(ns: Namespace, options?: RouterOptions): Router",
				description: "Create a router and register it in the namespace. Options: `mode` ('hash' | 'history', default 'hash'), `root` (CSS selector for container, default '#app').",
				example: `import { createRouter, start } from '@lopatnov/namespace-router';

const router = createRouter(app, {
  mode: 'hash',
  root: '#app',
});

start(router);`
			},
			{
				name: "start",
				signature: "start(router: Router): void",
				description: "Start the router — listen to URL changes, intercept `[data-nav]` link clicks, and render the current route.",
				example: `start(router);
// Now the router is active:
// - hashchange/popstate events are listened to
// - clicks on <a data-nav> are intercepted
// - current URL is matched and rendered`
			},
			{
				name: "stop",
				signature: "stop(router: Router): void",
				description: "Stop the router — remove all listeners and cleanup the current route.",
				example: "stop(router);"
			}
		]
	},
	{
		slug: "route",
		title: "route / navigate",
		methods: [{
			name: "route",
			signature: "route(router: Router, pattern: string, handler: RouteHandler): void",
			description: "Register a route. Patterns support `:param` placeholders and `*` wildcard. Handler receives `(container, params, query)` and may return a cleanup function.",
			example: `route(router, '/', (container) => {
  container.innerHTML = '<h1>Home</h1>';
});

route(router, '/users/:id', (container, params) => {
  container.innerHTML = \`User #\${params.id}\`;
});

route(router, '*', (container) => {
  container.innerHTML = '<h1>404</h1>';
});`
		}, {
			name: "navigate",
			signature: "navigate(router: Router, path: string): void",
			description: "Navigate to a path programmatically. In hash mode sets `location.hash`, in history mode calls `pushState`.",
			example: `navigate(router, '/users/42');`
		}]
	},
	{
		slug: "lazyRoute",
		title: "lazyRoute",
		methods: [{
			name: "lazyRoute",
			signature: "lazyRoute(loader: () => Promise<{ default: RouteHandler }>): RouteHandler",
			description: "Create a lazy-loaded route handler from a dynamic import. The module is fetched only on first navigation to the route, then cached. Perfect for code splitting.",
			example: `route(router, '/dashboard',
  lazyRoute(() => import('./pages/dashboard'))
);

// dashboard.ts is only loaded when the user
// navigates to /dashboard for the first time`
		}]
	},
	{
		slug: "back",
		title: "back / forward / getCurrentPath",
		methods: [
			{
				name: "back",
				signature: "back(): void",
				description: "Go back in browser history.",
				example: "back();"
			},
			{
				name: "forward",
				signature: "forward(): void",
				description: "Go forward in browser history.",
				example: "forward();"
			},
			{
				name: "getCurrentPath",
				signature: "getCurrentPath(router: Router): string",
				description: "Get the current route path.",
				example: `getCurrentPath(router);  // '/users/42'`
			}
		]
	}
];

//#endregion
export { routerMethods as t };