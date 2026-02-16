import { on } from "../../namespace/src/index.ts";
import { createRouter, getCurrentPath, lazyRoute, route, start } from "../../router/src/index.ts";
import { app } from "./ns.ts";

const router = createRouter(app, { mode: "hash", root: "#app" });

// --- Sidebar ---

const sidebarHTML = `
  <a class="logo" href="#/" data-nav>@lopatnov/namespace</a>
  <nav class="nav flex-column">
    <a class="nav-link" href="/" data-nav><i class="bi bi-house me-2"></i>Home</a>

    <div class="section-title">Namespace</div>
    <a class="nav-link" href="/namespace" data-nav>Overview</a>
    <a class="nav-link sub" href="/namespace/createNamespace" data-nav>createNamespace</a>
    <a class="nav-link sub" href="/namespace/provide" data-nav>provide / inject</a>
    <a class="nav-link sub" href="/namespace/has" data-nav>has / remove / keys</a>
    <a class="nav-link sub" href="/namespace/on" data-nav>on / off / emit</a>
    <a class="nav-link sub" href="/namespace/scope" data-nav>scope / root / parent</a>
    <a class="nav-link sub" href="/namespace/toJSON" data-nav>toJSON / clone / merge</a>

    <div class="section-title">Router</div>
    <a class="nav-link" href="/router" data-nav>Overview</a>
    <a class="nav-link sub" href="/router/createRouter" data-nav>createRouter / start</a>
    <a class="nav-link sub" href="/router/route" data-nav>route / navigate</a>
    <a class="nav-link sub" href="/router/lazyRoute" data-nav>lazyRoute</a>
    <a class="nav-link sub" href="/router/back" data-nav>back / forward</a>

    <div class="section-title">Modules</div>
    <a class="nav-link" href="/mvvm" data-nav>MVVM <span class="badge bg-secondary badge-soon">soon</span></a>
    <a class="nav-link" href="/component" data-nav>Components <span class="badge bg-secondary badge-soon">soon</span></a>
    <a class="nav-link" href="/plugin" data-nav>Plugins <span class="badge bg-secondary badge-soon">soon</span></a>

    <div class="section-title">Examples</div>
    <a class="nav-link" href="/examples/capitals" data-nav><i class="bi bi-globe me-1"></i>World Capitals</a>

    <hr class="mx-3 my-2" />
    <a class="nav-link" href="/about" data-nav><i class="bi bi-info-circle me-1"></i>About</a>
    <a class="nav-link" href="https://github.com/lopatnov/namespace" target="_blank">
      <i class="bi bi-github me-1"></i>GitHub <i class="bi bi-box-arrow-up-right" style="font-size:0.7rem"></i>
    </a>
  </nav>
`;

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
  "/mvvm",
  lazyRoute(() => import("./pages/placeholder.ts")),
);
route(
  router,
  "/component",
  lazyRoute(() => import("./pages/placeholder.ts")),
);
route(
  router,
  "/plugin",
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
