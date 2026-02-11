import { describe, expect, it } from "vitest";
import {
  benchmarkRender,
  isGpuUnavailableError,
} from "../utils/remotion";

const ANGLE_CHROMIUM_OPTIONS = { gl: "angle" } as const;
let warnedGpuUnavailable = false;

function logBenchmark(label: string, valueMs: number): void {
  // eslint-disable-next-line no-console
  console.log(`[benchmark] ${label}: ${valueMs.toFixed(2)}ms`);
}

function warnAndSkipGpuUnavailable(): void {
  if (warnedGpuUnavailable) {
    return;
  }

  warnedGpuUnavailable = true;
  // eslint-disable-next-line no-console
  console.warn(
    "Skipping Three.js performance benchmarks because WebGL is unavailable in this environment.",
  );
}

describe("Render time benchmarks", () => {
  it("measures baseline render costs for GSAP and combined compositions", async () => {
    const gsap = await benchmarkRender({
      compositionId: "GSAPFrameAccuracy",
      frame: 45,
      iterations: 3,
    });
    const combined = await benchmarkRender({
      compositionId: "CombinedShowcase",
      frame: 45,
      iterations: 3,
    });

    logBenchmark("GSAPFrameAccuracy(avg)", gsap.elapsedMs);
    logBenchmark("CombinedShowcase(avg)", combined.elapsedMs);

    expect(gsap.elapsedMs).toBeGreaterThan(0);
    expect(combined.elapsedMs).toBeGreaterThan(0);
    expect(combined.elapsedMs).toBeLessThan(gsap.elapsedMs * 8 + 400);
  });

  it("measures Three.js scene render time in chromium angle mode", async () => {
    try {
      const three = await benchmarkRender({
        compositionId: "ThreeRenderShowcase",
        frame: 45,
        iterations: 3,
        chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
      });

      logBenchmark("ThreeRenderShowcase(avg)", three.elapsedMs);

      // Guardrail only: avoids catastrophic regressions while keeping CI stable.
      expect(three.elapsedMs).toBeGreaterThan(0);
      expect(three.elapsedMs).toBeLessThan(20_000);
    } catch (error) {
      if (isGpuUnavailableError(error)) {
        warnAndSkipGpuUnavailable();
        return;
      }

      throw error;
    }
  });
});
