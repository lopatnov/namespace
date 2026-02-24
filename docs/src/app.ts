import { on } from "../../namespace/src/index.ts";
import { createRouter, lazyRoute, route, start } from "../../router/src/index.ts";
import { app } from "./ns.ts";
import sidebarHTML from "./sidebar.html";

const router = createRouter(app, { mode: "hash", root: "#app" });

// --- Sidebar ---

$("#sidebar-desktop").html(sidebarHTML);
$("#sidebar-mobile").html(sidebarHTML);

// --- Routes ---

route(
  router,
  "/",
  lazyRoute(() => import("./pages/home.ts")),
);

route(
  router,
  "/namespace",
  lazyRoute(() => import("./pages/namespace-overview.ts")),
);
route(
  router,
  "/namespace/:method",
  lazyRoute(() => import("./pages/namespace-method.ts")),
);

route(
  router,
  "/router",
  lazyRoute(() => import("./pages/router-overview.ts")),
);
route(
  router,
  "/router/:method",
  lazyRoute(() => import("./pages/router-method.ts")),
);

route(
  router,
  "/storage",
  lazyRoute(() => import("./pages/storage-overview.ts")),
);
route(
  router,
  "/storage/:method",
  lazyRoute(() => import("./pages/storage-method.ts")),
);

route(
  router,
  "/guards",
  lazyRoute(() => import("./pages/guards-overview.ts")),
);
route(
  router,
  "/guards/:method",
  lazyRoute(() => import("./pages/guards-method.ts")),
);

route(
  router,
  "/mvvm",
  lazyRoute(() => import("./pages/mvvm-overview.ts")),
);
route(
  router,
  "/mvvm/:method",
  lazyRoute(() => import("./pages/mvvm-method.ts")),
);
route(
  router,
  "/pwa",
  lazyRoute(() => import("./pages/pwa-overview.ts")),
);
route(
  router,
  "/pwa/:method",
  lazyRoute(() => import("./pages/pwa-method.ts")),
);

route(
  router,
  "/component",
  lazyRoute(() => import("./pages/component-overview.ts")),
);
route(
  router,
  "/component/:method",
  lazyRoute(() => import("./pages/component-method.ts")),
);

route(
  router,
  "/microfrontends",
  lazyRoute(() => import("./pages/placeholder.ts")),
);

route(
  router,
  "/examples/capitals",
  lazyRoute(() => import("./pages/capitals.ts")),
);
route(
  router,
  "/examples/capitals/:id",
  lazyRoute(() => import("./pages/capital-detail.ts")),
);

route(
  router,
  "/about",
  lazyRoute(() => import("./pages/about.ts")),
);

// --- Active link highlighting ---

on(app, "router:after", (path: string) => {
  $("[data-nav]").removeClass("active");
  $(`[data-nav][href="${path}"]`).addClass("active");

  // Close mobile offcanvas
  const offcanvasEl = document.getElementById("sidebarOffcanvas");
  if (offcanvasEl) {
    const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
    instance?.hide();
  }

  // Scroll to top
  window.scrollTo(0, 0);
});

// --- Start ---

start(router);
