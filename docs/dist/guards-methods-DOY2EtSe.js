//#region src/data/guards-methods.ts
const guardsMethods = [{
	slug: "guard",
	title: "guard",
	methods: [{
		name: "guard",
		signature: "guard(router: Router, pattern: string, fn: GuardFn): () => void",
		description: "Register a synchronous route guard. The guard function is called before every navigation to a path matching `pattern`. Return `true` to allow, `false` to cancel (stays on current page), or a path string to redirect. Patterns support `:param` and `*` wildcard (same syntax as `route()`). Returns an unsubscribe function.",
		example: `import { guard } from '@lopatnov/namespace-guards';

// Redirect unauthenticated users to /login
guard(router, '/admin/*', () => {
  return get(app.ns, 'user.isAdmin') ? true : '/login';
});

// Block navigation entirely
guard(router, '/locked', () => false);

// Remove guard
const unsub = guard(router, '/page', () => true);
unsub();`
	}]
}, {
	slug: "protect",
	title: "protect / allowed",
	methods: [{
		name: "protect",
		signature: "protect(ns: Namespace, key: string, fn: () => boolean): () => void",
		description: "Register an access check for a namespace key. Multiple protections on the same key are AND-combined — all must return `true` for access to be granted. Returns an unsubscribe function.",
		example: `import { protect } from '@lopatnov/namespace-guards';

// Only allow access to 'payment' service if user is logged in
protect(app.ns, 'payment', () => !!get(app.ns, 'user'));

// Additional check — must have a verified account
protect(app.ns, 'payment', () => !!get(app.ns, 'user.verified'));

// Remove protection
const unsub = protect(app.ns, 'resource', () => true);
unsub();`
	}, {
		name: "allowed",
		signature: "allowed(ns: Namespace, key: string): boolean",
		description: "Check whether access to a protected namespace key is currently allowed. Returns `true` if no protections are registered, or if all registered check functions return `true`.",
		example: `import { allowed } from '@lopatnov/namespace-guards';

if (allowed(app.ns, 'payment')) {
  const payment = get(app.ns, 'payment');
  // use payment service
} else {
  navigate(router, '/login');
}`
	}]
}];

//#endregion
export { guardsMethods as t };