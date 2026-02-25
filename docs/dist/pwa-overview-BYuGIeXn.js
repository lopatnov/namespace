import { n as navigate, r as get, t as app } from "./app.js";
import { t as pwaMethods } from "./pwa-methods-CEpqZieM.js";

//#region src/pages/pwa-overview.html
var pwa_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">PWA</h1>\r\n  <p class=\"lead text-body-secondary\">Progressive Web App utilities. Service Worker registration, install prompt, network status, and update management.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { registerSW, onInstallPrompt, promptInstall, isOnline, onOffline, onOnline, onUpdateAvailable, activateUpdate } from '@lopatnov/namespace-pwa';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/pwa-overview.ts
function pwaOverview(container) {
	const router = get(app, "router");
	container.innerHTML = pwa_overview_default;
	const cards = pwaMethods.map((g) => `
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
		navigate(router, `/pwa/${$(this).data("slug")}`);
	});
}

//#endregion
export { pwaOverview as default };