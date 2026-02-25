Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let _lopatnov_namespace_mvvm = require("@lopatnov/namespace-mvvm");

//#region src/index.ts
const _injectedStyles = /* @__PURE__ */ new Set();
function injectStyles(name, css) {
	if (_injectedStyles.has(name)) return;
	_injectedStyles.add(name);
	const styleEl = document.createElement("style");
	styleEl.setAttribute("data-ns-component", name);
	styleEl.textContent = css;
	document.head.appendChild(styleEl);
}
/**
* Define a component. Returns the same options object (typed), ready to pass to `mount`.
*/
function defineComponent(options) {
	return options;
}
/**
* Mount a component into `container`.
*
* @param def       - Component definition created with `defineComponent`.
* @param container - CSS selector string or an existing HTMLElement.
* @param props     - Props passed to the `state` factory.
* @returns A ComponentInstance with `el` and `destroy()`.
*/
function mount(def, container, props = {}) {
	const root = typeof container === "string" ? document.querySelector(container) : container;
	if (!root) throw new Error(`[namespace-component] Container not found: ${container}`);
	if (def.styles) injectStyles(def.name, def.styles);
	const wrapper = document.createElement("div");
	wrapper.setAttribute("data-ns-component", def.name);
	wrapper.innerHTML = def.template;
	const el = wrapper.firstElementChild ?? wrapper;
	const rawState = def.state ? def.state(props) : {};
	const methods = def.methods ?? {};
	const stateWithMethods = Object.assign(rawState, props);
	for (const [key, fn] of Object.entries(methods)) stateWithMethods[key] = fn.bind(stateWithMethods);
	const stopBindings = (0, _lopatnov_namespace_mvvm.bind)((0, _lopatnov_namespace_mvvm.reactive)(stateWithMethods), wrapper);
	root.appendChild(wrapper);
	def.mounted?.(el);
	return {
		el,
		destroy() {
			stopBindings();
			def.unmounted?.();
			wrapper.remove();
		}
	};
}

//#endregion
exports.defineComponent = defineComponent;
exports.mount = mount;