/**
 * Spike 0.1 — Automated GSAP determinism test
 *
 * Renders the same frame multiple times and compares output to verify
 * GSAP seek() produces deterministic results.
 *
 * Also tests non-sequential access: renders frame 60, then frame 10,
 * and compares frame 10 output to a baseline render of frame 10.
 */
import { renderStill, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out", "gsap-test");

function hashFile(path) {
  const data = readFileSync(path);
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function getComposition(bundleLocation, id) {
  return selectComposition({
    serveUrl: bundleLocation,
    id,
  });
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  console.log("=== Spike 0.1: GSAP Determinism Test ===\n");
  console.log("Step 1: Bundling Remotion project...");

  const bundleLocation = await bundle({
    entryPoint: join(__dirname, "..", "src", "index.ts"),
  });

  console.log("Bundle created at:", bundleLocation);

  const results = {
    determinism: { pass: false, details: "" },
    nonSequentialSeek: { pass: false, details: "" },
    delayRender: { pass: false, details: "" },
    targetLifecycle: { pass: false, details: "" },
  };

  // --- Test 1: Deterministic rendering ---
  console.log("\n--- Test 1: Deterministic rendering (same frame, 3 renders) ---");

  const seekComp = await getComposition(bundleLocation, "GSAPSeekTest");

  const hashes = [];
  for (let run = 0; run < 3; run++) {
    const outputPath = join(outDir, `seek-frame30-run${run}.png`);
    await renderStill({
      serveUrl: bundleLocation,
      composition: seekComp,
      output: outputPath,
      frame: 30,
    });
    hashes.push(hashFile(outputPath));
    console.log(`  Run ${run}: ${hashes[run].substring(0, 16)}...`);
  }

  const allMatch = hashes.every((h) => h === hashes[0]);
  results.determinism.pass = allMatch;
  results.determinism.details = allMatch
    ? "All 3 renders of frame 30 produced identical output"
    : `Hash mismatch: ${hashes.join(", ")}`;
  console.log(`  Result: ${allMatch ? "PASS" : "FAIL"}`);

  // --- Test 2: Non-sequential seeking ---
  console.log("\n--- Test 2: Non-sequential seek (render 60, then 10, compare to baseline 10) ---");

  // Render frame 10 as baseline
  const baseline10Path = join(outDir, "seek-frame10-baseline.png");
  await renderStill({
    serveUrl: bundleLocation,
    composition: seekComp,
    output: baseline10Path,
    frame: 10,
  });
  const baseline10Hash = hashFile(baseline10Path);

  // Render frame 60 first (to "pollute" state if any)
  await renderStill({
    serveUrl: bundleLocation,
    composition: seekComp,
    output: join(outDir, "seek-frame60.png"),
    frame: 60,
  });

  // Now render frame 10 again
  const after60Path = join(outDir, "seek-frame10-after60.png");
  await renderStill({
    serveUrl: bundleLocation,
    composition: seekComp,
    output: after60Path,
    frame: 10,
  });
  const after60Hash = hashFile(after60Path);

  const seekMatch = baseline10Hash === after60Hash;
  results.nonSequentialSeek.pass = seekMatch;
  results.nonSequentialSeek.details = seekMatch
    ? "Frame 10 identical whether rendered first or after frame 60"
    : `Baseline: ${baseline10Hash.substring(0, 16)}, After 60: ${after60Hash.substring(0, 16)}`;
  console.log(`  Baseline hash: ${baseline10Hash.substring(0, 16)}...`);
  console.log(`  After-60 hash: ${after60Hash.substring(0, 16)}...`);
  console.log(`  Result: ${seekMatch ? "PASS" : "FAIL"}`);

  // --- Test 3: delayRender integration ---
  console.log("\n--- Test 3: delayRender/continueRender integration ---");

  try {
    const delayComp = await getComposition(bundleLocation, "GSAPDelayRenderTest");
    const delayPath = join(outDir, "delay-render-frame0.png");
    await renderStill({
      serveUrl: bundleLocation,
      composition: delayComp,
      output: delayPath,
      frame: 0,
      timeoutInMilliseconds: 15000,
    });
    results.delayRender.pass = true;
    results.delayRender.details =
      "Frame 0 rendered successfully with delayRender/continueRender pattern";
    console.log("  Frame 0 rendered successfully");
    console.log("  Result: PASS");

    // Also render frame 45 (mid-animation) to verify seek works after delay
    const delayMidPath = join(outDir, "delay-render-frame45.png");
    await renderStill({
      serveUrl: bundleLocation,
      composition: delayComp,
      output: delayMidPath,
      frame: 45,
      timeoutInMilliseconds: 15000,
    });
    console.log("  Frame 45 rendered successfully (mid-animation)");
  } catch (err) {
    results.delayRender.pass = false;
    results.delayRender.details = `delayRender test failed: ${err.message}`;
    console.log(`  Result: FAIL - ${err.message}`);
  }

  // --- Test 4: Target lifecycle ---
  console.log("\n--- Test 4: Target lifecycle (always-mounted, sequence, hidden) ---");

  try {
    const lifecycleComp = await getComposition(bundleLocation, "GSAPTargetLifecycleTest");

    // Render frame 0 (before sequence mount at frame 30)
    const lifecyclePre = join(outDir, "lifecycle-frame0.png");
    await renderStill({
      serveUrl: bundleLocation,
      composition: lifecycleComp,
      output: lifecyclePre,
      frame: 0,
      timeoutInMilliseconds: 15000,
    });
    console.log("  Frame 0 rendered (pre-sequence mount)");

    // Render frame 45 (after sequence mount)
    const lifecyclePost = join(outDir, "lifecycle-frame45.png");
    await renderStill({
      serveUrl: bundleLocation,
      composition: lifecycleComp,
      output: lifecyclePost,
      frame: 45,
      timeoutInMilliseconds: 15000,
    });
    console.log("  Frame 45 rendered (post-sequence mount)");

    // Render frame 89 (end)
    const lifecycleEnd = join(outDir, "lifecycle-frame89.png");
    await renderStill({
      serveUrl: bundleLocation,
      composition: lifecycleComp,
      output: lifecycleEnd,
      frame: 89,
      timeoutInMilliseconds: 15000,
    });
    console.log("  Frame 89 rendered (end)");

    results.targetLifecycle.pass = true;
    results.targetLifecycle.details =
      "All target lifecycle test frames rendered. Check images manually for correctness.";
    console.log("  Result: PASS (rendered without errors — inspect images for correctness)");
  } catch (err) {
    results.targetLifecycle.pass = false;
    results.targetLifecycle.details = `Target lifecycle test failed: ${err.message}`;
    console.log(`  Result: FAIL - ${err.message}`);
  }

  // --- Summary ---
  console.log("\n=== SUMMARY ===");
  const allPassed = Object.values(results).every((r) => r.pass);
  for (const [name, result] of Object.entries(results)) {
    console.log(`  ${result.pass ? "PASS" : "FAIL"} ${name}: ${result.details}`);
  }
  console.log(`\nOverall: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log(`Output images in: ${outDir}`);

  // Write results as JSON
  writeFileSync(
    join(outDir, "results.json"),
    JSON.stringify(results, null, 2)
  );

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
