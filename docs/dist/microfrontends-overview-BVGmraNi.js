import { n as navigate, r as inject, t as app } from "./app.js";
import { t as microfrontendsMethods } from "./microfrontends-methods-VpbzjpZ2.js";

//#region src/pages/microfrontends-overview.html
var microfrontends_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Microfrontends</h1>\r\n  <p class=\"lead text-body-secondary\">Cross-app and cross-tab communication bus with leader election. BroadcastChannel event bus for orchestrating multiple isolated apps on the same page or across browser tabs.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { createBus, leaderElection } from '@lopatnov/namespace-microfrontends';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/microfrontends-overview.ts
function microfrontendsOverview(container) {
	const router = inject(app, "router");
	container.innerHTML = microfrontends_overview_default;
	const cards = microfrontendsMethods.map((g) => `
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
		navigate(router, `/microfrontends/${$(this).data("slug")}`);
	});
}

//#endregion
export { microfrontendsOverview as default };