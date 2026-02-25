import { describe, expect, it, vi } from "vitest";
import { defineComponent, mount } from "../src/index";

function setup(html = "<div id='app'></div>"): HTMLElement {
  document.body.innerHTML = html;
  return document.body.querySelector("#app") as HTMLElement;
}

// --- defineComponent ---

describe("defineComponent", () => {
  it("returns the same options object", () => {
    const opts = { name: "my-comp", template: "<span></span>" };
    expect(defineComponent(opts)).toBe(opts);
  });
});

// --- mount: template rendering ---

describe("mount — template", () => {
  it("renders template into container", () => {
    const container = setup();
    const def = defineComponent({ name: "hello", template: "<p>Hello</p>" });
    mount(def, container);
    expect(container.querySelector("p")!.textContent).toBe("Hello");
  });

  it("returns el pointing to the first element of the template", () => {
    const container = setup();
    const def = defineComponent({ name: "card", template: "<div class='card'></div>" });
    const { el } = mount(def, container);
    expect(el.classList.contains("card")).toBe(true);
  });

  it("throws when container selector not found", () => {
    const def = defineComponent({ name: "x", template: "<span></span>" });
    expect(() => mount(def, "#nonexistent")).toThrow();
  });

  it("accepts a CSS selector string", () => {
    setup("<div id='target'></div>");
    const def = defineComponent({ name: "sel", template: "<em>text</em>" });
    mount(def, "#target");
    expect(document.querySelector("#target em")!.textContent).toBe("text");
  });
});

// --- mount: state + data-bind ---

describe("mount — reactive state", () => {
  it("binds state to template via data-bind", () => {
    const container = setup();
    const def = defineComponent({
      name: "bound",
      template: '<span data-bind="text: greeting"></span>',
      state: () => ({ greeting: "Hi!" }),
    });
    mount(def, container);
    expect(container.querySelector("span")!.textContent).toBe("Hi!");
  });

  it("props are available in bindings", () => {
    const container = setup();
    const def = defineComponent<{ name: string }, object>({
      name: "with-props",
      template: '<b data-bind="text: name"></b>',
      state: (props) => ({ name: props.name }),
    });
    mount(def, container, { name: "Alice" });
    expect(container.querySelector("b")!.textContent).toBe("Alice");
  });
});

// --- mount: methods ---

describe("mount — methods", () => {
  it("methods are accessible from event bindings", () => {
    const container = setup();
    const handler = vi.fn();
    const def = defineComponent({
      name: "with-methods",
      template: '<button data-bind="event: { click: onClick }"></button>',
      state: () => ({}),
      methods: { onClick: handler },
    });
    mount(def, container);
    container.querySelector("button")!.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// --- mount: lifecycle ---

describe("mount — lifecycle hooks", () => {
  it("calls mounted after insert", () => {
    const container = setup();
    const mounted = vi.fn();
    const def = defineComponent({ name: "lifecycle", template: "<i></i>", mounted });
    mount(def, container);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it("calls unmounted on destroy", () => {
    const container = setup();
    const unmounted = vi.fn();
    const def = defineComponent({ name: "unmount-test", template: "<i></i>", unmounted });
    const { destroy } = mount(def, container);
    destroy();
    expect(unmounted).toHaveBeenCalledTimes(1);
  });

  it("removes element from DOM on destroy", () => {
    const container = setup();
    const def = defineComponent({ name: "removable", template: "<span class='rm'></span>" });
    const { destroy } = mount(def, container);
    expect(container.querySelector(".rm")).not.toBeNull();
    destroy();
    expect(container.querySelector(".rm")).toBeNull();
  });
});

// --- mount: styles ---

describe("mount — styles injection", () => {
  it("injects a <style> tag into <head>", () => {
    setup();
    const def = defineComponent({
      name: "styled-comp",
      template: "<div></div>",
      styles: ".styled-comp { color: red; }",
    });
    mount(def, setup());
    const style = document.head.querySelector('[data-ns-component="styled-comp"]');
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("color: red");
  });

  it("injects styles only once across multiple mounts", () => {
    const def = defineComponent({
      name: "once-styled",
      template: "<div></div>",
      styles: ".x { margin: 0; }",
    });
    mount(def, setup());
    mount(def, setup());
    const tags = document.head.querySelectorAll('[data-ns-component="once-styled"]');
    expect(tags.length).toBe(1);
  });
});
