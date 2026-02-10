import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "shader-raw-import",
      enforce: "pre",
      transform(_source, id) {
        if (!/\.(glsl|frag\.glsl|vert\.glsl|wgsl)$/.test(id)) {
          return null;
        }

        return {
          code: `export default ${JSON.stringify(readFileSync(id, "utf-8"))};`,
          map: null,
        };
      },
    },
  ],
  test: {
    globals: true,
    passWithNoTests: true,
  },
});
