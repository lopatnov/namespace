//#region src/data/namespace-methods.ts
const namespaceMethods = [
	{
		slug: "createNamespace",
		title: "createNamespace",
		methods: [{
			name: "createNamespace",
			signature: "createNamespace(): Namespace",
			description: "Creates a new root namespace. A namespace is a lightweight container for services, values, and child scopes. Internal storage uses Symbols — no key collisions with your data.",
			example: `import { createNamespace } from '@lopatnov/namespace';

const app = createNamespace();`
		}]
	},
	{
		slug: "provide",
		title: "provide / inject",
		methods: [{
			name: "provide",
			signature: "provide<T>(ns: Namespace, key: string, value: T): void",
			description: "Register a value under a key. Supports dot-paths like `'a.b.c'` — intermediate child namespaces are created automatically. Emits a `change` event that bubbles up to root.",
			example: `provide(app, 'config.apiUrl', '/api/v1');
provide(app, 'config.debug', true);
provide(app, 'greeting', 'Hello');`
		}, {
			name: "inject",
			signature: "inject<T>(ns: Namespace, key: string): T | undefined",
			description: "Retrieve a value by key. Supports dot-paths to reach into child namespaces. Returns `undefined` if the key does not exist. Works correctly with falsy values (0, '', false, null).",
			example: `const url = inject<string>(app, 'config.apiUrl');
// '/api/v1'

const missing = inject(app, 'nonexistent');
// undefined`
		}]
	},
	{
		slug: "has",
		title: "has / remove / keys / entries",
		methods: [
			{
				name: "has",
				signature: "has(ns: Namespace, key: string): boolean",
				description: "Check if a key exists. Supports dot-paths.",
				example: `has(app, 'config.apiUrl');  // true
has(app, 'nope');           // false`
			},
			{
				name: "remove",
				signature: "remove(ns: Namespace, key: string): boolean",
				description: "Remove a key and its subtree. Returns `true` if the key existed. Emits a `delete` event that bubbles up.",
				example: `remove(app, 'config.debug');  // true
remove(app, 'nope');          // false`
			},
			{
				name: "keys",
				signature: "keys(ns: Namespace): string[]",
				description: "List immediate child keys of a namespace.",
				example: `keys(app);  // ['config', 'greeting']`
			},
			{
				name: "entries",
				signature: "entries(ns: Namespace): [string, unknown][]",
				description: "List immediate entries (key-value pairs).",
				example: `entries(app);
// [['config', Namespace], ['greeting', 'Hello']]`
			}
		]
	},
	{
		slug: "on",
		title: "on / off / emit",
		methods: [
			{
				name: "on",
				signature: "on(ns: Namespace, event: string, handler: EventHandler): () => void",
				description: "Subscribe to an event. Returns an unsubscribe function. Built-in events: `change` (key, newValue, oldValue), `delete` (key). Events bubble up from child scopes to root.",
				example: `const unsub = on(app, 'change', (key, newVal, oldVal) => {
  console.log(\`\${key}: \${oldVal} → \${newVal}\`);
});

// Later:
unsub();  // unsubscribe`
			},
			{
				name: "off",
				signature: "off(ns: Namespace, event: string, handler: EventHandler): void",
				description: "Unsubscribe a specific handler from an event.",
				example: `const handler = () => console.log('fired');
on(app, 'custom', handler);
off(app, 'custom', handler);`
			},
			{
				name: "emit",
				signature: "emit(ns: Namespace, event: string, ...args: unknown[]): void",
				description: "Emit a custom event with arbitrary arguments.",
				example: `emit(app, 'user:login', { name: 'Admin' });`
			}
		]
	},
	{
		slug: "scope",
		title: "scope / root / parent / path",
		methods: [
			{
				name: "scope",
				signature: "scope(ns: Namespace, path: string): Namespace",
				description: "Get or create a child namespace. Supports dot-paths — intermediate levels are created automatically. Child namespaces share the event bus (events bubble up to root).",
				example: `const auth = scope(app, 'auth');
provide(auth, 'token', 'abc123');

// Same as:
provide(app, 'auth.token', 'abc123');`
			},
			{
				name: "root",
				signature: "root(ns: Namespace): Namespace",
				description: "Get the root namespace from any child.",
				example: `const auth = scope(app, 'auth');
root(auth) === app;  // true`
			},
			{
				name: "parent",
				signature: "parent(ns: Namespace): Namespace | null",
				description: "Get the parent namespace. Returns `null` for root.",
				example: `parent(auth) === app;   // true
parent(app) === null;   // true`
			},
			{
				name: "path",
				signature: "path(ns: Namespace): string",
				description: "Get the dot-path from root to this namespace. Empty string for root.",
				example: `path(app);   // ''
path(auth);  // 'auth'`
			}
		]
	},
	{
		slug: "toJSON",
		title: "toJSON / fromJSON / clone / merge",
		methods: [
			{
				name: "toJSON",
				signature: "toJSON(ns: Namespace): Record<string, unknown>",
				description: "Serialize the namespace tree to a plain object. Functions are skipped. Child namespaces become nested objects.",
				example: `const snapshot = toJSON(app);
// { config: { apiUrl: '/api/v1' }, greeting: 'Hello' }`
			},
			{
				name: "fromJSON",
				signature: "fromJSON(data: Record<string, unknown>): Namespace",
				description: "Restore a namespace tree from a plain object.",
				example: `const restored = fromJSON({ config: { debug: true } });
inject(restored, 'config.debug');  // true`
			},
			{
				name: "clone",
				signature: "clone(ns: Namespace): Namespace",
				description: "Deep clone a namespace tree (serializes then restores).",
				example: "const copy = clone(app);"
			},
			{
				name: "merge",
				signature: "merge(ns: Namespace, data: Record<string, unknown>): void",
				description: "Merge a plain object into a namespace. Nested objects become child namespaces. Existing values are overwritten.",
				example: "merge(app, { config: { debug: false }, newKey: 42 });"
			}
		]
	}
];

//#endregion
export { namespaceMethods as t };