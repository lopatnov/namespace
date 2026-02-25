//#region src/data/component-methods.ts
const componentMethods = [{
	slug: "defineComponent",
	title: "defineComponent",
	methods: [{
		name: "defineComponent",
		signature: "defineComponent<P, S>(options: ComponentOptions<P, S>): ComponentDef<P, S>",
		description: "Define a reusable component. Accepts a `name`, `template` HTML string, optional `styles` CSS, a `state` factory, `methods`, and lifecycle hooks `mounted` / `unmounted`. Returns the same options object typed as a `ComponentDef` — pass it directly to `mount()`.",
		example: `import { defineComponent } from '@lopatnov/namespace-component';

const UserCard = defineComponent({
  name: 'user-card',

  template: \`
    <div class="user-card">
      <img data-bind="attr: { src: avatar }" />
      <h3 data-bind="text: name"></h3>
      <span data-bind="text: role"></span>
      <button data-bind="event: { click: onEdit }">Edit</button>
    </div>\`,

  styles: \`
    .user-card { border: 1px solid #ccc; padding: 16px; border-radius: 8px; }
    .user-card h3 { margin: 0 0 4px; }\`,

  state: (props) => ({
    name: props.name,
    avatar: props.avatar ?? '/img/default.png',
    role: props.role ?? 'User',
  }),

  methods: {
    onEdit() {
      console.log('edit', this.name);
    },
  },

  mounted(el) {
    // el is the root HTMLElement — jQuery plugins work here
    // $(el).tooltip({ trigger: 'hover' });
    console.log('UserCard mounted');
  },

  unmounted() {
    console.log('UserCard unmounted');
  },
});`
	}]
}, {
	slug: "mount",
	title: "mount",
	methods: [{
		name: "mount",
		signature: "mount<P, S>(def: ComponentDef<P, S>, container: Element | string, props?: P): ComponentInstance",
		description: "Mount a component into a container. The `container` can be a CSS selector string or an existing `Element`. Props are passed to the `state` factory. Returns a `ComponentInstance` with the root `el` element and a `destroy()` method to unmount. Scoped styles are injected into `<head>` once per component name.",
		example: `import { mount } from '@lopatnov/namespace-component';

// Mount by CSS selector
const instance = mount(UserCard, '#user-container', {
  name: 'Alice',
  avatar: '/img/alice.jpg',
  role: 'Admin',
});

// Access the root element
console.log(instance.el); // HTMLElement

// Unmount and clean up all bindings
instance.destroy();

// Mount multiple instances
const users = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob',   role: 'User'  },
];
for (const user of users) {
  mount(UserCard, '#users-list', user);
}`
	}]
}];

//#endregion
export { componentMethods as t };