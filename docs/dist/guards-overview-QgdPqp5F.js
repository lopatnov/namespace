import { n as navigate, r as get, t as app } from "./app.js";
import { t as guardsMethods } from "./guards-methods-DOY2EtSe.js";

//#region src/pages/guards-overview.html
var guards_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Guards</h1>\r\n  <p class=\"lead text-body-secondary\">Route guards and namespace service access checks. Intercept navigation and protect services with synchronous predicates.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { guard, protect, allowed } from '@lopatnov/namespace-guards';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/guards-overview.ts
function guardsOverview(container) {
	const router = get(app, "router");
	container.innerHTML = guards_overview_default;
	const cards = guardsMethods.map((g) => `
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
		navigate(router, `/guards/${$(this).data("slug")}`);
	});
}

//#endregion
export { guardsOverview as default };