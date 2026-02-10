import { Options } from "tsup";
import { readFileSync } from "fs";

/**
 * tsup plugin: Import .glsl, .frag, .vert, .wgsl shader files as raw strings.
 * Used by effects and three packages for bundling shader source code.
 */
const shaderRawPlugin = {
  name: "shader-raw-import",
  setup(build: any) {
    build.onLoad(
      { filter: /\.(glsl|frag|vert|wgsl)$/ },
      (args: { path: string }) => ({
        contents: `export default ${JSON.stringify(readFileSync(args.path, "utf-8"))};`,
        loader: "js" as const,
      })
    );
  },
};

export const baseConfig: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: true,
  esbuildPlugins: [shaderRawPlugin],
};
