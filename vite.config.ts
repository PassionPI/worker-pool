import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default mergeConfig(
  defineViteConfig({
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      lib: {
        name: "work_pool",
        entry: "src/index.ts",
        formats: ["cjs", "es", "iife"],
        fileName: (format) =>
          format === "cjs" ? `bundle.${format}` : `bundle.${format}.js`,
      },
    },
  }),
  defineVitestConfig({
    test: {},
  })
);
