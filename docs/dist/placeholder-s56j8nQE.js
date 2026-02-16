import { i as inject, n as getCurrentPath, t as app } from "./app.js";

//#region src/pages/placeholder.html
var placeholder_default = "<div class=\"py-4\">\r\n  <h1 id=\"module-name\"></h1>\r\n  <span class=\"badge bg-secondary fs-6 mb-4\">Coming soon</span>\r\n  <hr />\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <p class=\"mb-0\" id=\"module-description\"></p>\r\n    </div>\r\n  </div>\r\n  <p class=\"text-muted mt-4\">\r\n    This module is planned for a future release. Check the\r\n    <a href=\"https://github.com/lopatnov/namespace\" target=\"_blank\">GitHub repository</a>\r\n    for progress updates.\r\n  </p>\r\n</div>\r\n";

//#endregion
//#region src/pages/placeholder.ts
const modules = {
	"/mvvm": {
		title: "MVVM",
		description: "Reactive data-binding for DOM elements using ES2024 Proxy. Knockout.js-style data-bind attributes (text, value, visible, foreach, if) powered by jQuery selectors."
	},
	"/component": {
		title: "Components",
		description: "Reusable UI blocks with scoped CSS, template literals or .html templates, state management, and lifecycle hooks (mounted/unmounted). Works with any jQuery plugin."
	},
	"/plugin": {
		title: "Plugins",
		description: "Structured plugin system. A plugin is a package that registers its own routes, components, and services. Supports dynamic loading without rebuild."
	}
};
function placeholder(container) {
	const mod = modules[getCurrentPath(inject(app, "router"))] ?? {
		title: "Unknown",
		description: ""
	};
	container.innerHTML = placeholder_default;
	$("#module-name").text(mod.title);
	$("#module-description").text(mod.description);
}

//#endregion
export { placeholder as default };