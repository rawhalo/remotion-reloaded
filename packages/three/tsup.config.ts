import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.base";

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts"],
  external: [
    "remotion",
    "react",
    "three",
    "three/webgpu",
    "@react-three/fiber",
    "@remotion/three",
  ],
});
