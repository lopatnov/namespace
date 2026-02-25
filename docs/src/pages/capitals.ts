import { bind, reactive } from "../../../mvvm/src/index.ts";
import { inject } from "../../../namespace/src/index.ts";
import { navigate } from "../../../router/src/index.ts";
import { capitals } from "../data/capitals.ts";
import { app } from "../ns.ts";
import template from "./capitals.html";

export default function capitalsPage(container: Element) {
  const router = inject(app, "router") as any;
  container.innerHTML = template;

  const state = reactive({
    query: "",
    items: [...capitals],
    onFilter(this: { query: string; items: typeof capitals }) {
      const q = this.query.toLowerCase().trim();
      this.items = q
        ? capitals.filter(
            (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
          )
        : [...capitals];
      $("#capitals-empty").toggleClass("d-none", this.items.length > 0);
    },
  });

  bind(state, container);

  // Click delegation — works with MVVM foreach-rendered rows
  $(container).on("click", ".capital-row", function () {
    navigate(router, `/examples/capitals/${$(this).data("id")}`);
  });
}
