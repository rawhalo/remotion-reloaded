import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.base";

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts", "src/config.ts"],
  external: ["remotion", "react", "gsap", "three", "@react-three/fiber"],
});
