/**
 * Spike 0.3 — WebGL/WebGPU availability test
 *
 * Tests what GPU capabilities are available in Remotion's headless Chrome.
 * This script runs locally to establish a baseline, and the same test
 * will run in GitHub Actions CI to compare.
 */
import { renderStill, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out", "webgl-test");

async function main() {
  mkdirSync(outDir, { recursive: true });

  console.log("=== Spike 0.3: WebGL/WebGPU Availability Test ===\n");
  console.log("Step 1: Bundling Remotion project...");

  const bundleLocation = await bundle({
    entryPoint: join(__dirname, "..", "src", "index.ts"),
  });

  console.log("Bundle created at:", bundleLocation);

  // Use the WebGLProbe composition
  const comp = await selectComposition({
    serveUrl: bundleLocation,
    id: "WebGLProbe",
  });

  console.log("\n--- Rendering WebGL probe ---");

  const probePath = join(outDir, "webgl-probe.png");
  await renderStill({
    serveUrl: bundleLocation,
    composition: comp,
    output: probePath,
    frame: 0,
    timeoutInMilliseconds: 30000,
  });

  console.log("  Probe rendered successfully");

  // Test with different Chromium flags
  console.log("\n--- Testing Chromium flag combinations ---");

  const flagTests = [
    { name: "default", flags: [] },
    { name: "angle", flags: ["--use-angle=default"] },
    { name: "swiftshader", flags: ["--use-gl=swiftshader"] },
    { name: "webgpu", flags: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"] },
  ];

  for (const test of flagTests) {
    try {
      const testPath = join(outDir, `probe-${test.name}.png`);
      await renderStill({
        serveUrl: bundleLocation,
        composition: comp,
        output: testPath,
        frame: 0,
        timeoutInMilliseconds: 15000,
        chromiumOptions: {
          gl: test.name === "swiftshader" ? "swiftshader" : test.name === "angle" ? "angle" : undefined,
          enableMultiProcessOnLinux: false,
        },
      });
      console.log(`  ${test.name}: RENDERED OK`);
    } catch (err) {
      console.log(`  ${test.name}: FAILED — ${err.message.substring(0, 100)}`);
    }
  }

  console.log("\n=== Done ===");
  console.log(`Output in: ${outDir}`);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
