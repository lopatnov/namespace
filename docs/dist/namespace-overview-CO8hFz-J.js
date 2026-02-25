import { n as navigate, r as get, t as app } from "./app.js";
import { t as namespaceMethods } from "./namespace-methods-BqitJQVW.js";

//#region src/pages/namespace-overview.html
var namespace_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Namespace</h1>\r\n  <p class=\"lead text-body-secondary\">Core kernel — service registry, event bus, scoped namespaces.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { createApp, set, get, on, scope } from '@lopatnov/namespace';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/namespace-overview.ts
function namespaceOverview(container) {
	const router = get(app, "router");
	container.innerHTML = namespace_overview_default;
	const cards = namespaceMethods.map((g) => `
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
		navigate(router, `/namespace/${$(this).data("slug")}`);
	});
}

//#endregion
export { namespaceOverview as default };