import { i as inject, r as navigate, t as app } from "./app.js";
import { t as capitals } from "./capitals-DITjSB8O.js";

//#region src/pages/capitals.html
var capitals_default = "<div class=\"py-4\">\r\n  <h1 class=\"mb-1\"><i class=\"bi bi-globe me-2\"></i>World Capitals</h1>\r\n  <p class=\"lead text-body-secondary\">Click a capital to see live weather and currency exchange rates.</p>\r\n  <p class=\"small text-muted\">\r\n    This example demonstrates route params (<code>/examples/capitals/:id</code>),\r\n    lazy loading, and live API integration (Open-Meteo, Monobank).\r\n  </p>\r\n  <hr />\r\n  <div class=\"table-responsive\">\r\n    <table class=\"table table-hover\">\r\n      <thead>\r\n        <tr>\r\n          <th>Capital</th>\r\n          <th>Country</th>\r\n          <th>Currency</th>\r\n          <th></th>\r\n        </tr>\r\n      </thead>\r\n      <tbody id=\"capitals-tbody\"></tbody>\r\n    </table>\r\n  </div>\r\n</div>\r\n";

//#endregion
//#region src/pages/capitals.ts
function capitalsPage(container) {
	const router = inject(app, "router");
	container.innerHTML = capitals_default;
	const rows = capitals.map((c) => `
    <tr class="capital-row" data-id="${c.id}" style="cursor:pointer">
      <td><strong>${c.name}</strong></td>
      <td>${c.country}</td>
      <td><span class="badge bg-info text-dark">${c.currencyName}</span></td>
      <td class="text-end"><i class="bi bi-chevron-right text-muted"></i></td>
    </tr>`).join("");
	$("#capitals-tbody").html(rows);
	$(".capital-row").on("click", function() {
		navigate(router, `/examples/capitals/${$(this).data("id")}`);
	});
}

//#endregion
export { capitalsPage as default };