declare module "*.html" {
  const content: string;
  export default content;
}

declare const $: JQueryStatic;
declare const bootstrap: {
  Offcanvas: {
    getInstance(el: string | Element): { hide(): void } | null;
  };
};
