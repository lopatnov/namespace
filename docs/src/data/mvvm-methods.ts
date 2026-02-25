import type { MethodGroup } from "./namespace-methods.ts";

export const mvvmMethods: MethodGroup[] = [
  {
    slug: "reactive",
    title: "reactive",
    methods: [
      {
        name: "reactive",
        signature: "reactive<T extends object>(obj: T): T",
        description:
          "Wrap a plain object in a reactive Proxy. Property reads inside active effects are tracked as dependencies; assignments notify all dependents. Nested objects are recursively proxied and cached — the same Proxy is always returned for the same underlying object. Note: in-place array mutations (push, pop, splice…) do not auto-trigger effects. Use immutable style: `state.items = [...state.items, newItem]`.",
        example: `import { reactive } from '@lopatnov/namespace-mvvm';

const state = reactive({
  count: 0,
  user: { name: 'Alice', isAdmin: false },
  items: ['apple', 'banana'],
});

// Mutations trigger bound DOM automatically
state.count++;
state.user.name = 'Bob';

// Array: use immutable style
state.items = [...state.items, 'cherry'];`,
      },
    ],
  },
  {
    slug: "bind",
    title: "bind",
    methods: [
      {
        name: "bind",
        signature: "bind(state: object, root: Element | string): () => void",
        description:
          "Activate `data-bind` bindings on all elements within a DOM subtree. Scans the subtree for `[data-bind]` attributes and sets up reactive DOM updates. Returns a cleanup function that removes all active effects and event listeners. The `root` argument can be a CSS selector string or an Element.",
        example: `import { reactive, bind } from '@lopatnov/namespace-mvvm';

const state = reactive({ name: 'World', count: 0 });

const stop = bind(state, '#app');

// DOM updates automatically when state changes:
state.name = 'Universe';
state.count++;

// Remove all bindings when no longer needed:
stop();`,
      },
    ],
  },
  {
    slug: "text-html",
    title: "text / html",
    methods: [
      {
        name: "text",
        signature: 'data-bind="text: expr"',
        description:
          "Set the element's `textContent` to the evaluated expression. Special HTML characters are escaped automatically. Re-runs whenever reactive dependencies change.",
        example: `<!-- HTML -->
<span data-bind="text: user.name">Loading…</span>
<p data-bind="text: count + ' items'"></p>

// JS
state.user.name = 'Alice';  // → <span>Alice</span>
state.count = 5;            // → <p>5 items</p>`,
      },
      {
        name: "html",
        signature: 'data-bind="html: expr"',
        description:
          "Set the element's `innerHTML` to the evaluated expression. Use when you need to render rich HTML content. Caution: only bind to trusted content to avoid XSS.",
        example: `<!-- HTML -->
<div data-bind="html: content"></div>

// JS
state.content = '<strong>Bold</strong> text';`,
      },
    ],
  },
  {
    slug: "visible-if",
    title: "visible / if",
    methods: [
      {
        name: "visible",
        signature: 'data-bind="visible: expr"',
        description:
          "Show or hide the element by toggling `style.display`. The element remains in the DOM — its child bindings stay active. Use `visible` when the element is frequently toggled.",
        example: `<!-- HTML -->
<div data-bind="visible: isLoggedIn">
  Welcome back!
</div>
<p data-bind="visible: errors.length > 0" class="error">
  Please fix the errors above.
</p>

// JS
state.isLoggedIn = true;   // div appears
state.isLoggedIn = false;  // div hidden`,
      },
      {
        name: "if",
        signature: 'data-bind="if: expr"',
        description:
          "Conditionally show or hide an element. In this implementation, `if` behaves like `visible` (display toggle). The element and its bindings remain active regardless.",
        example: `<!-- HTML -->
<section data-bind="if: user">
  <h2 data-bind="text: user.name"></h2>
</section>`,
      },
    ],
  },
  {
    slug: "value-checked",
    title: "value / checked",
    methods: [
      {
        name: "value",
        signature: 'data-bind="value: expr"',
        description:
          "Two-way binding for text inputs, textareas, and selects. Reads from state when state changes and writes back to state on `input`/`change` events. The expression must be an assignable path (e.g. `searchQuery`, `user.name`).",
        example: `<!-- HTML -->
<input type="text" data-bind="value: searchQuery" />
<textarea data-bind="value: comment"></textarea>

// JS — input updates state, state updates input
state.searchQuery = 'initial value';

// When user types "hello" in the input:
// state.searchQuery === 'hello'`,
      },
      {
        name: "checked",
        signature: 'data-bind="checked: expr"',
        description:
          "Two-way binding for checkboxes. Reads the boolean state into `element.checked` and writes back on `change` events.",
        example: `<!-- HTML -->
<input type="checkbox" data-bind="checked: acceptTerms" />

// JS
state.acceptTerms = false;
// User checks the box → state.acceptTerms === true`,
      },
    ],
  },
  {
    slug: "css-attr",
    title: "css / attr",
    methods: [
      {
        name: "css",
        signature: 'data-bind="css: { className: expr, ... }"',
        description:
          "Toggle CSS classes based on boolean expressions. The binding object maps class names to expressions. Multiple classes can be controlled in one binding.",
        example: `<!-- HTML -->
<li data-bind="css: { active: isSelected, disabled: !isEnabled }"></li>

// JS
state.isSelected = true;   // adds class 'active'
state.isEnabled = false;   // adds class 'disabled'`,
      },
      {
        name: "attr",
        signature: 'data-bind="attr: { attrName: expr, ... }"',
        description:
          "Set element attributes from expressions. Pass `null`, `false`, or `undefined` to remove the attribute. Multiple attributes can be bound in one object.",
        example: `<!-- HTML -->
<img data-bind="attr: { src: avatarUrl, alt: user.name }" />
<a data-bind="attr: { href: profileUrl, target: '_blank' }">Profile</a>

// JS
state.avatarUrl = '/img/alice.jpg';
state.user.name = 'Alice';`,
      },
    ],
  },
  {
    slug: "event-foreach",
    title: "event / foreach",
    methods: [
      {
        name: "event",
        signature: 'data-bind="event: { eventName: handler, ... }"',
        description:
          "Attach event listeners. Handlers are evaluated once at bind time and are assumed to be stable references. Multiple events can be bound in one object.",
        example: `<!-- HTML -->
<button data-bind="event: { click: onSave, mouseenter: onHover }">Save</button>

// JS
const state = reactive({
  onSave() { console.log('saved'); },
  onHover() { console.log('hover'); },
});`,
      },
      {
        name: "foreach",
        signature: 'data-bind="foreach: arrayExpr"',
        description:
          "Repeat the element's children for each item in an array. The children template is cloned for each item and bound to the item as the local state. Inside the template, use `$data` to refer to the current item (useful when iterating over primitives). Object items can be accessed directly by property name. Re-renders the entire list when the array reference changes.",
        example: `<!-- HTML — object array -->
<ul data-bind="foreach: users">
  <li>
    <span data-bind="text: name"></span>
    <em data-bind="text: role"></em>
  </li>
</ul>

<!-- HTML — primitive array -->
<ul data-bind="foreach: tags">
  <li data-bind="text: $data"></li>
</ul>

// JS
state.users = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob',   role: 'User'  },
];
state.tags = ['js', 'ts', 'mvvm'];

// Add item (immutable style required):
state.users = [...state.users, { name: 'Carol', role: 'User' }];`,
      },
    ],
  },
];
