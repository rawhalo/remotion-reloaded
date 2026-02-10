import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globals: true,
    hookTimeout: 120_000,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    testTimeout: 120_000,
  },
});
