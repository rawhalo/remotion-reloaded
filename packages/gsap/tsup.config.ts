import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.base";

export default defineConfig({
  ...baseConfig,
  entry: [
    "src/index.ts",
    "src/register-all.ts",
    "src/morphsvg.ts",
    "src/splittext.ts",
    "src/drawsvg.ts",
  ],
  external: ["remotion", "react", "gsap"],
});
