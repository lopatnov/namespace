//#region src/index.d.ts
/**
 * Create a reactive proxy. Property reads inside active effects are tracked
 * as dependencies. Assignments notify dependents automatically.
 *
 * Note: For arrays, in-place mutations (push, pop, splice…) do not
 * auto-trigger dependent effects. Use immutable style instead:
 *   `state.items = [...state.items, newItem]`
 *
 * @example
 * const state = reactive({ count: 0, user: { name: 'Alice' } });
 * state.count++;  // effects depending on count re-run
 */
declare function reactive<T extends object>(obj: T): T;
/**
 * Activate `data-bind` bindings on all elements within a DOM subtree.
 * Returns a cleanup function that removes all active bindings.
 *
 * Supported bindings:
 * - `text: expr`           → element.textContent
 * - `html: expr`           → element.innerHTML
 * - `visible: expr`        → CSS display
 * - `if: expr`             → CSS display (conditional show/hide)
 * - `value: expr`          → two-way binding for inputs
 * - `checked: expr`        → two-way binding for checkboxes
 * - `attr: { name: expr }` → element attributes
 * - `css: { cls: expr }`   → CSS class toggle
 * - `event: { ev: fn }`    → event listeners
 * - `foreach: arrayExpr`   → repeat children for each item
 *
 * @example
 * const state = reactive({ name: 'World', items: ['a', 'b'] });
 * const stop = bind(state, '#app');
 * state.name = 'Universe';  // DOM updates automatically
 * // Later:
 * stop();
 */
declare function bind(state: object, root: Element | string): () => void;
//#endregion
export { bind, reactive };