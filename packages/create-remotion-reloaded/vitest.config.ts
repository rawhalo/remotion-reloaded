import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/__tests__/**"],
    },
  },
});
