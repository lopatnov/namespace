//#region src/index.d.ts
interface ComponentOptions<Props extends object, State extends object> {
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
interface ComponentInstance {
  /** Root DOM element of the mounted component. */
  el: HTMLElement;
  /** Cleanup / unmount the component instance. */
  destroy: () => void;
}
type ComponentDef<P extends object, S extends object> = ComponentOptions<P, S>;
/**
 * Define a component. Returns the same options object (typed), ready to pass to `mount`.
 */
declare function defineComponent<P extends object = object, S extends object = object>(options: ComponentOptions<P, S>): ComponentDef<P, S>;
/**
 * Mount a component into `container`.
 *
 * @param def       - Component definition created with `defineComponent`.
 * @param container - CSS selector string or an existing HTMLElement.
 * @param props     - Props passed to the `state` factory.
 * @returns A ComponentInstance with `el` and `destroy()`.
 */
declare function mount<P extends object, S extends object>(def: ComponentDef<P, S>, container: Element | string, props?: P): ComponentInstance;
//#endregion
export { ComponentDef, ComponentInstance, ComponentOptions, defineComponent, mount };