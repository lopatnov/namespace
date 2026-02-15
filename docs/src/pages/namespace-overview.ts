import { inject } from "../../../namespace/src/index.ts";
import { navigate } from "../../../router/src/index.ts";
import { namespaceMethods } from "../data/namespace-methods.ts";
import { app } from "../ns.ts";
import template from "./namespace-overview.html";

export default function namespaceOverview(container: Element) {
  const router = inject(app, "router") as any;
  container.innerHTML = template;

  const cards = namespaceMethods
    .map(
      (g) => `
    <div class="col-md-6">
      <div class="card h-100 method-card" style="cursor:pointer" data-slug="${g.slug}">
        <div class="card-body">
          <h6 class="card-title font-monospace">${g.title}</h6>
          <p class="card-text small text-muted">${g.methods.map((m) => m.name).join(", ")}</p>
        </div>
      </div>
    </div>`,
    )
    .join("");

  $("#method-cards").html(cards);

  $(".method-card").on("click", function () {
    navigate(router, `/namespace/${$(this).data("slug")}`);
  });
}
