import { bind, reactive } from "@lopatnov/namespace-mvvm";

// --- Types ---

export interface ComponentOptions<Props extends object, State extends object> {
  /** Unique component name (for debugging / registry). */
  name: string;
  /** HTML template string. */
  template: string;
  /** Optional CSS string. Applied once as a <style> tag when first component is mounted. */
  styles?: string;
  /**
   * Factory that produces the initial reactive state from the given props.
   * Runs once per mount call.
   */
  state?: (props: Props) => State;
  /** Methods that will be mixed into the state proxy (have access to state via `this`). */
  methods?: Record<string, (this: State & Props, ...args: unknown[]) => unknown>;
  /** Called after the element is inserted into the DOM. Receives the root HTMLElement. */
  mounted?: (el: HTMLElement) => void;
  /** Called just before the component is destroyed. */
  unmounted?: () => void;
}

export interface ComponentInstance {
  /** Root DOM element of the mounted component. */
  el: HTMLElement;
  /** Cleanup / unmount the component instance. */
  destroy: () => void;
}

export type ComponentDef<P extends object, S extends object> = ComponentOptions<P, S>;

// --- Internal ---

const _injectedStyles = new Set<string>();

function injectStyles(name: string, css: string): void {
  if (_injectedStyles.has(name)) return;
  _injectedStyles.add(name);
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-ns-component", name);
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

// --- Public API ---

/**
 * Define a component. Returns the same options object (typed), ready to pass to `mount`.
 */
export function defineComponent<P extends object = object, S extends object = object>(
  options: ComponentOptions<P, S>,
): ComponentDef<P, S> {
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
export function mount<P extends object, S extends object>(
  def: ComponentDef<P, S>,
  container: Element | string,
  props: P = {} as P,
): ComponentInstance {
  const root: Element | null =
    typeof container === "string" ? document.querySelector(container) : container;

  if (!root) throw new Error(`[namespace-component] Container not found: ${container}`);

  // Inject scoped styles once
  if (def.styles) injectStyles(def.name, def.styles);

  // Create wrapper element
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-ns-component", def.name);
  wrapper.innerHTML = def.template;

  const el = (wrapper.firstElementChild as HTMLElement) ?? wrapper;

  // Build reactive state
  const rawState = def.state ? def.state(props) : ({} as S);

  // Mix methods into state
  const methods = def.methods ?? {};
  const stateWithMethods = Object.assign(rawState, props);
  for (const [key, fn] of Object.entries(methods)) {
    (stateWithMethods as Record<string, unknown>)[key] = fn.bind(stateWithMethods as S & P);
  }

  const state = reactive(stateWithMethods);

  // Activate bindings
  const stopBindings = bind(state, wrapper);

  // Insert into DOM
  root.appendChild(wrapper);

  // Lifecycle hook
  def.mounted?.(el);

  return {
    el,
    destroy() {
      stopBindings();
      def.unmounted?.();
      wrapper.remove();
    },
  };
}
