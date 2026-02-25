import { t as microfrontendsMethods } from "./microfrontends-methods-VpbzjpZ2.js";

//#region src/pages/microfrontends-method.html
var microfrontends_method_default = "<div class=\"py-4\">\r\n  <nav aria-label=\"breadcrumb\">\r\n    <ol class=\"breadcrumb\">\r\n      <li class=\"breadcrumb-item\"><a href=\"/microfrontends\" data-nav>Microfrontends</a></li>\r\n      <li class=\"breadcrumb-item active\" id=\"breadcrumb-title\"></li>\r\n    </ol>\r\n  </nav>\r\n  <h1 class=\"font-monospace mb-4\" id=\"method-title\"></h1>\r\n  <div id=\"methods-list\"></div>\r\n  <a href=\"/microfrontends\" data-nav class=\"btn btn-outline-secondary btn-sm mt-4\"><i class=\"bi bi-arrow-left me-1\"></i>Back to Overview</a>\r\n</div>\r\n";

//#endregion
//#region src/pages/microfrontends-method.ts
function microfrontendsMethod(container, params) {
	const group = microfrontendsMethods.find((g) => g.slug === params.method);
	if (!group) {
		container.innerHTML = `
      <div class="py-4">
        <h1>Method not found</h1>
        <p>No documentation for <code>${params.method}</code>.</p>
        <a href="/microfrontends" data-nav class="btn btn-outline-primary">Back to Microfrontends</a>
      </div>`;
		return;
	}
	container.innerHTML = microfrontends_method_default;
	$("#breadcrumb-title").text(group.title);
	$("#method-title").text(group.title);
	const html = group.methods.map((m) => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="method-signature">${escapeHtml(m.signature)}</div>
        <p>${m.description}</p>
        <pre class="bg-dark text-light p-3 rounded"><code>${escapeHtml(m.example)}</code></pre>
      </div>
    </div>`).join("");
	$("#methods-list").html(html);
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

//#endregion
export { microfrontendsMethod as default };