import { get } from "../../../namespace/src/index.ts";
import { getCurrentPath } from "../../../router/src/index.ts";
import { app } from "../ns.ts";
import template from "./placeholder.html";

const modules: Record<string, { title: string; description: string }> = {
  "/mvvm": {
    title: "MVVM",
    description:
      "Reactive data-binding for DOM elements using ES2024 Proxy. Knockout.js-style data-bind attributes (text, value, visible, foreach, if) powered by jQuery selectors.",
  },
  "/component": {
    title: "Components",
    description:
      "Reusable UI blocks with scoped CSS, template literals or .html templates, state management, and lifecycle hooks (mounted/unmounted). Works with any jQuery plugin.",
  },
  "/plugin": {
    title: "Plugins",
    description:
      "Structured plugin system. A plugin is a package that registers its own routes, components, and services. Supports dynamic loading without rebuild.",
  },
};

export default function placeholder(container: Element) {
  const router = get(app, "router") as any;
  const currentPath = getCurrentPath(router);
  const mod = modules[currentPath] ?? { title: "Unknown", description: "" };

  container.innerHTML = template;
  $("#module-name").text(mod.title);
  $("#module-description").text(mod.description);
}
