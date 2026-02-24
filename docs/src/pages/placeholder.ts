import { get } from "../../../namespace/src/index.ts";
import { getCurrentPath } from "../../../router/src/index.ts";
import { app } from "../ns.ts";
import template from "./placeholder.html";

const modules: Record<string, { title: string; description: string }> = {
  "/microfrontends": {
    title: "Microfrontends",
    description:
      "Cross-app and cross-tab communication bus, leader election, and app registry. BroadcastChannel-based event bus for orchestrating multiple isolated apps on the same page or across browser tabs.",
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
