import { describe, expect, it, vi } from "vitest";
import { bind, reactive } from "../src/index";

// --- Helpers ---

function setup(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

// --- reactive ---

describe("reactive", () => {
  it("returns the same proxy for the same object", () => {
    const obj = { x: 1 };
    const a = reactive(obj);
    const b = reactive(obj);
    expect(a).toBe(b);
  });

  it("reflects property mutations", () => {
    const state = reactive({ count: 0 });
    state.count = 5;
    expect(state.count).toBe(5);
  });

  it("proxies nested objects", () => {
    const state = reactive({ user: { name: "Alice" } });
    expect(state.user.name).toBe("Alice");
    state.user.name = "Bob";
    expect(state.user.name).toBe("Bob");
  });

  it("nested proxy is cached (same reference)", () => {
    const state = reactive({ user: { name: "Alice" } });
    const u1 = state.user;
    const u2 = state.user;
    expect(u1).toBe(u2);
  });
});

// --- bind: text ---

describe("bind — text", () => {
  it("sets initial textContent", () => {
    const root = setup(`<div><span data-bind="text: name"></span></div>`);
    const state = reactive({ name: "World" });
    bind(state, root);
    expect(root.querySelector("span")!.textContent).toBe("World");
  });

  it("updates textContent on state change", () => {
    const root = setup(`<div><span data-bind="text: name"></span></div>`);
    const state = reactive({ name: "World" });
    bind(state, root);

    state.name = "Universe";
    expect(root.querySelector("span")!.textContent).toBe("Universe");
  });

  it("cleanup stops updates", () => {
    const root = setup(`<div><span data-bind="text: x"></span></div>`);
    const state = reactive({ x: "a" });
    const stop = bind(state, root);

    stop();
    state.x = "b";
    expect(root.querySelector("span")!.textContent).toBe("a");
  });
});

// --- bind: html ---

describe("bind — html", () => {
  it("sets innerHTML", () => {
    const root = setup(`<div data-bind="html: content"></div>`);
    const state = reactive({ content: "<b>Bold</b>" });
    bind(state, root);
    expect(root.querySelector("div")!.innerHTML).toBe("<b>Bold</b>");
  });

  it("updates innerHTML on change", () => {
    const root = setup(`<div data-bind="html: content"></div>`);
    const state = reactive({ content: "old" });
    bind(state, root);
    state.content = "<em>new</em>";
    expect(root.querySelector("div")!.innerHTML).toBe("<em>new</em>");
  });
});

// --- bind: visible ---

describe("bind — visible", () => {
  it("shows element when truthy", () => {
    const root = setup(`<div><p data-bind="visible: show"></p></div>`);
    const state = reactive({ show: true });
    bind(state, root);
    expect((root.querySelector("p") as HTMLElement).style.display).toBe("");
  });

  it("hides element when falsy", () => {
    const root = setup(`<div><p data-bind="visible: show"></p></div>`);
    const state = reactive({ show: false });
    bind(state, root);
    expect((root.querySelector("p") as HTMLElement).style.display).toBe("none");
  });

  it("toggles on state change", () => {
    const root = setup(`<div><p data-bind="visible: show"></p></div>`);
    const state = reactive({ show: true });
    bind(state, root);

    state.show = false;
    expect((root.querySelector("p") as HTMLElement).style.display).toBe("none");

    state.show = true;
    expect((root.querySelector("p") as HTMLElement).style.display).toBe("");
  });
});

// --- bind: value (two-way) ---

describe("bind — value", () => {
  it("sets initial input value", () => {
    const root = setup(`<div><input data-bind="value: query" /></div>`);
    const state = reactive({ query: "hello" });
    bind(state, root);
    expect((root.querySelector("input") as HTMLInputElement).value).toBe("hello");
  });

  it("updates input value on state change", () => {
    const root = setup(`<div><input data-bind="value: query" /></div>`);
    const state = reactive({ query: "" });
    bind(state, root);

    state.query = "updated";
    expect((root.querySelector("input") as HTMLInputElement).value).toBe("updated");
  });

  it("updates state on input event", () => {
    const root = setup(`<div><input data-bind="value: query" /></div>`);
    const state = reactive({ query: "" });
    bind(state, root);

    const input = root.querySelector("input") as HTMLInputElement;
    input.value = "typed";
    input.dispatchEvent(new Event("input"));

    expect(state.query).toBe("typed");
  });
});

// --- bind: css ---

describe("bind — css", () => {
  it("toggles class when truthy", () => {
    const root = setup(`<div><p data-bind="css: { active: isActive }"></p></div>`);
    const state = reactive({ isActive: true });
    bind(state, root);
    expect(root.querySelector("p")!.classList.contains("active")).toBe(true);
  });

  it("removes class when falsy", () => {
    const root = setup(`<div><p data-bind="css: { active: isActive }"></p></div>`);
    const state = reactive({ isActive: false });
    bind(state, root);
    expect(root.querySelector("p")!.classList.contains("active")).toBe(false);
  });

  it("reacts to state change", () => {
    const root = setup(`<div><p data-bind="css: { on: flag }"></p></div>`);
    const state = reactive({ flag: false });
    bind(state, root);

    state.flag = true;
    expect(root.querySelector("p")!.classList.contains("on")).toBe(true);

    state.flag = false;
    expect(root.querySelector("p")!.classList.contains("on")).toBe(false);
  });
});

// --- bind: attr ---

describe("bind — attr", () => {
  it("sets attribute", () => {
    const root = setup(`<div><img data-bind="attr: { src: imgSrc }" /></div>`);
    const state = reactive({ imgSrc: "/img/foo.png" });
    bind(state, root);
    expect(root.querySelector("img")!.getAttribute("src")).toBe("/img/foo.png");
  });

  it("removes attribute on null", () => {
    const root = setup(`<div><img data-bind="attr: { alt: label }" alt="old" /></div>`);
    const state = reactive({ label: null as string | null });
    bind(state, root);
    expect(root.querySelector("img")!.hasAttribute("alt")).toBe(false);
  });
});

// --- bind: event ---

describe("bind — event", () => {
  it("calls handler on event", () => {
    const root = setup(`<div><button data-bind="event: { click: onClick }"></button></div>`);
    const handler = vi.fn();
    const state = reactive({ onClick: handler });
    bind(state, root);

    root.querySelector("button")!.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// --- bind: foreach ---

describe("bind — foreach", () => {
  it("renders items", () => {
    const root = setup(
      `<div><ul data-bind="foreach: items"><li data-bind="text: $data"></li></ul></div>`,
    );
    const state = reactive({ items: ["a", "b", "c"] });
    bind(state, root);

    const lis = root.querySelectorAll("li");
    expect(lis.length).toBe(3);
    expect(lis[0].textContent).toBe("a");
    expect(lis[1].textContent).toBe("b");
    expect(lis[2].textContent).toBe("c");
  });

  it("re-renders when array is replaced", () => {
    const root = setup(
      `<div><ul data-bind="foreach: items"><li data-bind="text: $data"></li></ul></div>`,
    );
    const state = reactive({ items: ["x"] });
    bind(state, root);

    state.items = ["a", "b"];

    const lis = root.querySelectorAll("li");
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toBe("a");
    expect(lis[1].textContent).toBe("b");
  });

  it("renders object items with property bindings", () => {
    const root = setup(
      `<div><ul data-bind="foreach: users"><li data-bind="text: name"></li></ul></div>`,
    );
    const state = reactive({ users: [{ name: "Alice" }, { name: "Bob" }] });
    bind(state, root);

    const lis = root.querySelectorAll("li");
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toBe("Alice");
    expect(lis[1].textContent).toBe("Bob");
  });

  it("renders empty array without items", () => {
    const root = setup(
      `<div><ul data-bind="foreach: items"><li data-bind="text: $data"></li></ul></div>`,
    );
    const state = reactive({ items: [] as string[] });
    bind(state, root);

    expect(root.querySelectorAll("li").length).toBe(0);
  });
});

// --- bind: multiple bindings ---

describe("bind — multiple bindings on one element", () => {
  it("applies all bindings", () => {
    const root = setup(`<div><span data-bind="text: label, visible: show"></span></div>`);
    const state = reactive({ label: "Hi", show: true });
    bind(state, root);

    const span = root.querySelector("span") as HTMLElement;
    expect(span.textContent).toBe("Hi");
    expect(span.style.display).toBe("");

    state.show = false;
    expect(span.style.display).toBe("none");
  });
});

// --- bind: nested state ---

describe("bind — nested state", () => {
  it("binds to nested property via dot-path", () => {
    const root = setup(`<div><span data-bind="text: user.name"></span></div>`);
    const state = reactive({ user: { name: "Alice" } });
    bind(state, root);

    expect(root.querySelector("span")!.textContent).toBe("Alice");

    state.user.name = "Bob";
    expect(root.querySelector("span")!.textContent).toBe("Bob");
  });
});
