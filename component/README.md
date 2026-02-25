# @lopatnov/namespace-component

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-component)](https://www.npmjs.com/package/@lopatnov/namespace-component)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-component)](LICENSE)

Reusable components for `@lopatnov/namespace`. Template + scoped CSS + reactive state + lifecycle hooks — no Shadow DOM, jQuery-compatible.

## Install

```sh
npm install @lopatnov/namespace-mvvm @lopatnov/namespace-component
```

## Quick start

```ts
import { defineComponent, mount } from '@lopatnov/namespace-component';

const Counter = defineComponent({
  name: 'Counter',
  template: `
    <div class="counter">
      <span data-bind="text: count"></span>
      <button data-bind="click: increment">+1</button>
    </div>
  `,
  styles: `.counter { display: flex; gap: 8px; align-items: center; }`,
  state: (props: { initial?: number }) => ({
    count: props.initial ?? 0,
  }),
  methods: {
    increment() { this.count++; },
  },
  mounted(el) { console.log('Counter mounted', el); },
  unmounted() { console.log('Counter destroyed'); },
});

// Mount into a container
const instance = mount(Counter, document.getElementById('app'), { initial: 5 });

// Later: clean up
instance.destroy();
```

## API

### `defineComponent(options)`

Type-safe identity helper — ensures correct inference of `Props` and `State`. Returns the same options object.

### `mount(def, container, props?)`

Renders the component into `container`, injects scoped styles (once per component name), creates reactive state, wires bindings, and calls `mounted`. Returns a `ComponentInstance`.

```ts
interface ComponentInstance {
  el: HTMLElement;      // root DOM element
  destroy(): void;      // unmount and clean up
}
```

### ComponentOptions

```ts
interface ComponentOptions<Props, State> {
  name: string;
  template: string;
  styles?: string;                               // injected once as <style data-ns-component="name">
  state?: (props: Props) => State;
  methods?: Record<string, (this: State & Props, ...args: unknown[]) => unknown>;
  mounted?: (el: HTMLElement) => void;
  unmounted?: () => void;
}
```

### Reactivity

Component state is wrapped in `reactive()` from `@lopatnov/namespace-mvvm`. All `data-bind` attributes in the template are resolved automatically.

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
