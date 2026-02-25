import { n as navigate, r as inject, t as app } from "./app.js";
import { t as componentMethods } from "./component-methods-BreH3D09.js";

//#region src/pages/component-overview.html
var component_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Component</h1>\r\n  <p class=\"lead text-body-secondary\">Reusable components with template, scoped CSS, reactive state, and lifecycle hooks. No Shadow DOM — jQuery plugins work inside components.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { defineComponent, mount } from '@lopatnov/namespace-component';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/component-overview.ts
function componentOverview(container) {
	const router = inject(app, "router");
	container.innerHTML = component_overview_default;
	const cards = componentMethods.map((g) => `
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
		navigate(router, `/component/${$(this).data("slug")}`);
	});
}

//#endregion
export { componentOverview as default };