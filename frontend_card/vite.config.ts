import { resolve } from "node:path";
import { defineConfig } from "vite";

const outDir = resolve(__dirname, "../custom_components/ha_calc/www");

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/ha-3d-print-calc-card.ts"),
      formats: ["es"],
      fileName: () => "ha-3d-print-calc-card.js",
    },
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "ha-3d-print-calc-card.js",
      },
    },
  },
});
