import { resolve } from "node:path";
import { defineConfig } from "vite";

// Deux pages : la home et le gabarit de case study (case.html?slug=...)
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        case: resolve(import.meta.dirname, "case.html"),
      },
    },
  },
});
