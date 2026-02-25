# @lopatnov/namespace-mvvm

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-mvvm)](https://www.npmjs.com/package/@lopatnov/namespace-mvvm)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-mvvm)](LICENSE)

Reactive DOM bindings for `@lopatnov/namespace`. Knockout.js-style `data-bind` attributes powered by ES2024 `Proxy` — no virtual DOM, no JSX, works alongside jQuery.

## Install

```sh
npm install @lopatnov/namespace-mvvm
```

## Quick start

```ts
import { reactive, bind } from '@lopatnov/namespace-mvvm';

const state = reactive({ name: 'Alice', count: 0 });

// Bind to a DOM container
bind(state, '#app');

// Any assignment triggers DOM update automatically
state.name = 'Bob';
state.count++;
```

```html
<div id="app">
  <p data-bind="text: name"></p>
  <p data-bind="text: count"></p>
  <input data-bind="value: name" />
  <button data-bind="click: increment">+1</button>
</div>
```

## Bindings

| Binding | Description |
|---------|-------------|
| `text: expr` | Sets `element.textContent` |
| `html: expr` | Sets `element.innerHTML` |
| `value: expr` | Two-way binding for `<input>`, `<select>`, `<textarea>` |
| `checked: expr` | Two-way binding for checkboxes |
| `visible: expr` | Toggles `display: none` |
| `css: { class: expr }` | Conditionally add/remove CSS classes |
| `attr: { name: expr }` | Set arbitrary attributes |
| `click: method` | Attach a click handler (method name on state) |
| `foreach: array` | Repeat child template for each item |
| `if: expr` | Conditionally render element |

## API

### `reactive<T>(obj: T): T`

Wraps an object in an ES2024 `Proxy`. Property reads inside active effects are tracked; assignments automatically notify dependents.

> Arrays: use immutable updates to trigger reactivity:
> `state.items = [...state.items, newItem]`
> In-place mutations (`push`, `pop`, etc.) do not auto-trigger.

### `bind(state, root): () => void`

Walk the DOM under `root` (CSS selector or `Element`), wire up all `data-bind` attributes, and subscribe to `state` changes. Returns a cleanup function that detaches all listeners.

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
