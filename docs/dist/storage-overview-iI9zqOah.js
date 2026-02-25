import { n as navigate, r as inject, t as app } from "./app.js";
import { t as storageMethods } from "./storage-methods-C1HyAoPX.js";

//#region src/pages/storage-overview.html
var storage_overview_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\">Storage</h1>\r\n  <p class=\"lead text-body-secondary\">Persistent namespace — auto-sync keys to localStorage, sessionStorage, or IndexedDB.</p>\r\n  <hr />\r\n  <pre class=\"bg-dark text-light p-3 rounded\"><code>import { persist, restore, createIndexedDB } from '@lopatnov/namespace-storage';</code></pre>\r\n  <div class=\"row g-3 mt-3\" id=\"method-cards\"></div>\r\n</div>\r\n";

//#endregion
//#region src/pages/storage-overview.ts
function storageOverview(container) {
	const router = inject(app, "router");
	container.innerHTML = storage_overview_default;
	const cards = storageMethods.map((g) => `
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
		navigate(router, `/storage/${$(this).data("slug")}`);
	});
}

//#endregion
export { storageOverview as default };