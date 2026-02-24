// ============================================================
// @lopatnov/namespace-mvvm — Reactive DOM bindings
// ES2024, Proxy-based reactivity, Knockout.js-style data-bind.
// ============================================================

// --- Reactivity core ---

type Effect = () => void;

let _activeEffect: Effect | null = null;
let _activeDeps: Set<Set<Effect>> | null = null;

function track(depMap: Map<string | symbol, Set<Effect>>, key: string | symbol): void {
  if (!_activeEffect) return;
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Set<Effect>();
    depMap.set(key, dep);
  }
  dep.add(_activeEffect);
  _activeDeps?.add(dep);
}

function trigger(depMap: Map<string | symbol, Set<Effect>>, key: string | symbol): void {
  const dep = depMap.get(key);
  if (dep) {
    for (const effect of [...dep]) {
      effect();
    }
  }
}

const _proxyCache = new WeakMap<object, object>();

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
export function reactive<T extends object>(obj: T): T {
  if (_proxyCache.has(obj)) return _proxyCache.get(obj) as T;

  const depMap = new Map<string | symbol, Set<Effect>>();

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (typeof key === "string" || typeof key === "symbol") {
        track(depMap, key);
      }
      const value = Reflect.get(target, key, receiver);
      if (value !== null && typeof value === "object") {
        return reactive(value as object);
      }
      return value;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      if (typeof key === "string" || typeof key === "symbol") {
        trigger(depMap, key);
      }
      return result;
    },
  });

  _proxyCache.set(obj, proxy);
  return proxy;
}

/**
 * Create a reactive effect. Runs immediately, then re-runs whenever any
 * reactive property accessed during its execution changes.
 * Returns a cleanup function that removes the effect from all subscriptions.
 */
function createEffect(fn: () => void): () => void {
  const subscribedDeps = new Set<Set<Effect>>();

  const effect: Effect = () => {
    for (const dep of subscribedDeps) dep.delete(effect);
    subscribedDeps.clear();

    const prevEffect = _activeEffect;
    const prevDeps = _activeDeps;
    _activeEffect = effect;
    _activeDeps = subscribedDeps;

    try {
      fn();
    } finally {
      _activeEffect = prevEffect;
      _activeDeps = prevDeps;
    }
  };

  effect(); // initial run — subscribes to reactive deps

  return () => {
    for (const dep of subscribedDeps) dep.delete(effect);
    subscribedDeps.clear();
  };
}

// --- Expression evaluation ---

function evalExpr(expr: string, state: object): unknown {
  try {
    return new Function("$data", `with($data){return(${expr});}`)(state);
  } catch {
    return undefined;
  }
}

// --- Binding parser ---

/**
 * Parse a data-bind string into a map of binding type → expression string.
 * Handles nested braces/brackets/parens, so objects and arrays in
 * expressions are correctly delimited.
 *
 * Examples:
 *   "text: name"                        → { text: "name" }
 *   "visible: isAdmin, css: { x: flag}" → { visible: "isAdmin", css: "{ x: flag }" }
 */
function parseBindings(bindStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  let remaining = bindStr.trim();

  while (remaining.length > 0) {
    const colonIdx = remaining.indexOf(":");
    if (colonIdx === -1) break;

    const key = remaining.slice(0, colonIdx).trim();
    remaining = remaining.slice(colonIdx + 1).trim();

    let depth = 0;
    let inStr: string | null = null;
    let i = 0;

    for (; i < remaining.length; i++) {
      const ch = remaining[i];
      if (inStr) {
        if (ch === inStr && remaining[i - 1] !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
      } else if (ch === "{" || ch === "[" || ch === "(") {
        depth++;
      } else if (ch === "}" || ch === "]" || ch === ")") {
        depth--;
      } else if (ch === "," && depth === 0) {
        break;
      }
    }

    result[key] = remaining.slice(0, i).trim();
    remaining = remaining.slice(i + 1).trim();
  }

  return result;
}

// --- DOM binding ---

function bindElement(el: Element, state: object): () => void {
  const cleanups: Array<() => void> = [];
  const bindAttr = el.getAttribute("data-bind");

  if (bindAttr) {
    const bindings = parseBindings(bindAttr);

    for (const [type, expr] of Object.entries(bindings)) {
      applyBinding(type, expr, el, state, cleanups);
    }
  }

  // Recurse into children unless this element manages its own children (foreach)
  if (!el.getAttribute("data-bind")?.includes("foreach:")) {
    for (const child of Array.from(el.children)) {
      cleanups.push(bindElement(child as Element, state));
    }
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

function applyBinding(
  type: string,
  expr: string,
  el: Element,
  state: object,
  cleanups: Array<() => void>,
): void {
  switch (type) {
    case "text": {
      cleanups.push(
        createEffect(() => {
          el.textContent = String(evalExpr(expr, state) ?? "");
        }),
      );
      break;
    }

    case "html": {
      cleanups.push(
        createEffect(() => {
          el.innerHTML = String(evalExpr(expr, state) ?? "");
        }),
      );
      break;
    }

    case "visible": {
      cleanups.push(
        createEffect(() => {
          (el as HTMLElement).style.display = evalExpr(expr, state) ? "" : "none";
        }),
      );
      break;
    }

    case "if": {
      // Simple implementation: hide/show. For full insert/remove, see docs.
      cleanups.push(
        createEffect(() => {
          (el as HTMLElement).style.display = evalExpr(expr, state) ? "" : "none";
        }),
      );
      break;
    }

    case "value": {
      // Read side
      cleanups.push(
        createEffect(() => {
          (el as HTMLInputElement).value = String(evalExpr(expr, state) ?? "");
        }),
      );
      // Write side — two-way binding
      const writeHandler = (e: Event) => {
        try {
          const val = (e.target as HTMLInputElement).value;
          new Function("$data", "v", `with($data){${expr}=v;}`)(state, val);
        } catch {
          // ignore assignment errors
        }
      };
      el.addEventListener("input", writeHandler);
      el.addEventListener("change", writeHandler);
      cleanups.push(() => {
        el.removeEventListener("input", writeHandler);
        el.removeEventListener("change", writeHandler);
      });
      break;
    }

    case "checked": {
      cleanups.push(
        createEffect(() => {
          (el as HTMLInputElement).checked = Boolean(evalExpr(expr, state));
        }),
      );
      const checkHandler = (e: Event) => {
        try {
          const val = (e.target as HTMLInputElement).checked;
          new Function("$data", "v", `with($data){${expr}=v;}`)(state, val);
        } catch {
          // ignore
        }
      };
      el.addEventListener("change", checkHandler);
      cleanups.push(() => el.removeEventListener("change", checkHandler));
      break;
    }

    case "attr": {
      cleanups.push(
        createEffect(() => {
          const attrs = evalExpr(expr, state) as Record<string, unknown>;
          if (attrs && typeof attrs === "object") {
            for (const [name, val] of Object.entries(attrs)) {
              if (val === null || val === false || val === undefined) {
                el.removeAttribute(name);
              } else {
                el.setAttribute(name, String(val));
              }
            }
          }
        }),
      );
      break;
    }

    case "css": {
      cleanups.push(
        createEffect(() => {
          const classes = evalExpr(expr, state) as Record<string, unknown>;
          if (classes && typeof classes === "object") {
            for (const [cls, active] of Object.entries(classes)) {
              el.classList.toggle(cls, Boolean(active));
            }
          }
        }),
      );
      break;
    }

    case "event": {
      // Evaluated once — handlers are assumed to be stable references
      const handlers = evalExpr(expr, state) as Record<string, unknown>;
      if (handlers && typeof handlers === "object") {
        for (const [eventName, fn] of Object.entries(handlers)) {
          if (typeof fn === "function") {
            el.addEventListener(eventName, fn as EventListener);
            cleanups.push(() => el.removeEventListener(eventName, fn as EventListener));
          }
        }
      }
      break;
    }

    case "foreach": {
      const templateHTML = el.innerHTML;
      el.innerHTML = "";

      const itemCleanups: Array<() => void> = [];

      const stopEffect = createEffect(() => {
        for (const fn of itemCleanups) fn();
        itemCleanups.length = 0;
        el.innerHTML = "";

        const items = evalExpr(expr, state);
        if (!Array.isArray(items)) return;

        for (const item of items) {
          const itemState =
            typeof item === "object" && item !== null ? (item as object) : { $data: item };

          const wrapper = document.createElement("div");
          wrapper.innerHTML = templateHTML;

          for (const child of Array.from(wrapper.children)) {
            const cleanup = bindElement(child as Element, itemState);
            itemCleanups.push(cleanup);
            el.appendChild(child);
          }
        }
      });

      cleanups.push(() => {
        stopEffect();
        for (const fn of itemCleanups) fn();
        itemCleanups.length = 0;
      });
      break;
    }

    default:
      break;
  }
}

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
export function bind(state: object, root: Element | string): () => void {
  if (typeof document === "undefined") return () => {};

  const rootEl = typeof root === "string" ? document.querySelector(root) : root;
  if (!rootEl) return () => {};

  return bindElement(rootEl, state);
}
