import { n as navigate, r as get, t as app } from "./app.js";
import { t as pluginMethods } from "./plugin-methods-BXkaHER1.js";

//#region src/pages/plugin-overview.html
var plugin_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Plugin</h1>\r\n  <p class=\"lead text-body-secondary\">Extensible plugin system for pure-function users. Define, install, query, and uninstall plugins on any namespace at runtime.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { definePlugin, usePlugin, installed, uninstallPlugin } from '@lopatnov/namespace-plugin';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/plugin-overview.ts
function pluginOverview(container) {
	const router = get(app, "router");
	container.innerHTML = plugin_overview_default;
	const cards = pluginMethods.map((g) => `
    <div class="col-md-6">
      <div class="card h-100 method-card" style="cursor:pointer" data-slug="${g.slug}">
        <div class="card-body">
          <h6 class="card-title font-monospace">${g.title}</h6>
          <p class="card-text small text-muted">${g.methods.map((m) => m.name).join(", ")}</p>
        </div>
      </div>
    </div>`).join("");
	$("#method-cards").html(cards);
	$(".method-card").on("click", function() {
		navigate(router, `/plugin/${$(this).data("slug")}`);
	});
}

//#endregion
export { pluginOverview as default };