import { inject } from "../../../namespace/src/index.ts";
import { navigate } from "../../../router/src/index.ts";
import { capitals } from "../data/capitals.ts";
import { app } from "../ns.ts";
import template from "./capitals.html";

export default function capitalsPage(container: Element) {
  const router = inject(app, "router") as any;
  container.innerHTML = template;

  const rows = capitals
    .map(
      (c) => `
    <tr class="capital-row" data-id="${c.id}" style="cursor:pointer">
      <td><strong>${c.name}</strong></td>
      <td>${c.country}</td>
      <td><span class="badge bg-info text-dark">${c.currencyName}</span></td>
      <td class="text-end"><i class="bi bi-chevron-right text-muted"></i></td>
    </tr>`,
    )
    .join("");

  $("#capitals-tbody").html(rows);

  $(".capital-row").on("click", function () {
    navigate(router, `/examples/capitals/${$(this).data("id")}`);
  });
}
