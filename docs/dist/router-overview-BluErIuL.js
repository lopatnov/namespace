import { n as navigate, r as get, t as app } from "./app.js";
import { t as routerMethods } from "./router-methods-CqQlr3Cg.js";

//#region src/pages/router-overview.html
var router_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Router</h1>\r\n  <p class=\"lead text-body-secondary\">SPA routing with lazy loading, route params, hash &amp; history modes.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { createRouter, route, lazyRoute, navigate, start } from '@lopatnov/namespace-router';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/router-overview.ts
function routerOverview(container) {
	const router = get(app, "router");
	container.innerHTML = router_overview_default;
	const cards = routerMethods.map((g) => `
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
		navigate(router, `/router/${$(this).data("slug")}`);
	});
}

//#endregion
export { routerOverview as default };