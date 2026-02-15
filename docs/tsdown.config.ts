import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ["src/app.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  platform: "browser",
  target: "esnext",
  outDir: "dist",
  loader: { ".html": "text" },
  noExternal: [/.*/],
  alias: {
    "@lopatnov/namespace": resolve(__dirname, "../namespace/src/index.ts"),
  },
});
