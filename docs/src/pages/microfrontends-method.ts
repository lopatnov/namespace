import { microfrontendsMethods } from "../data/microfrontends-methods.ts";
import template from "./microfrontends-method.html";

export default function microfrontendsMethod(container: Element, params: Record<string, string>) {
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

  container.innerHTML = template;
  $("#breadcrumb-title").text(group.title);
  $("#method-title").text(group.title);

  const html = group.methods
    .map(
      (m) => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="method-signature">${escapeHtml(m.signature)}</div>
        <p>${m.description}</p>
        <pre class="bg-dark text-light p-3 rounded"><code>${escapeHtml(m.example)}</code></pre>
      </div>
    </div>`,
    )
    .join("");

  $("#methods-list").html(html);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
