import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.base";

export default defineConfig({
  ...baseConfig,
  entry: [
    "src/index.ts",
    "src/cli.ts",
    "src/create.ts",
    "src/init.ts",
    "src/doctor.ts",
  ],
  platform: "node",
  target: "node18",
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
