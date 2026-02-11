import { describe, expect, it } from "vitest";
import {
  benchmarkRender,
  isGpuUnavailableError,
} from "../utils/remotion";

const ANGLE_CHROMIUM_OPTIONS = { gl: "angle" } as const;
let warnedGpuUnavailable = false;

function toEstimatedFps(avgRenderMs: number): number {
  return avgRenderMs <= 0 ? 0 : 1000 / avgRenderMs;
}

function warnAndSkipGpuUnavailable(): void {
  if (warnedGpuUnavailable) {
    return;
  }

  warnedGpuUnavailable = true;
  // eslint-disable-next-line no-console
  console.warn(
    "Skipping particle performance benchmarks because WebGL is unavailable in this environment.",
  );
}

describe("Particle performance benchmarks", () => {
  it("benchmarks estimated FPS at two particle densities", async () => {
    try {
      const lowDensity = await benchmarkRender({
        compositionId: "ParticleShowcase",
        frame: 50,
        iterations: 3,
        chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
        inputProps: {
          behavior: "flow-field",
          count: 900,
          seed: 77,
        },
      });

      const highDensity = await benchmarkRender({
        compositionId: "ParticleShowcase",
        frame: 50,
        iterations: 3,
        chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
        inputProps: {
          behavior: "flow-field",
          count: 3000,
          seed: 77,
        },
      });

      const lowFps = toEstimatedFps(lowDensity.elapsedMs);
      const highFps = toEstimatedFps(highDensity.elapsedMs);

      // eslint-disable-next-line no-console
      console.log(
        `[benchmark] particles low=${lowDensity.elapsedMs.toFixed(2)}ms (${lowFps.toFixed(2)} fps), ` +
          `high=${highDensity.elapsedMs.toFixed(2)}ms (${highFps.toFixed(2)} fps)`,
      );

      expect(lowFps).toBeGreaterThan(0);
      expect(highFps).toBeGreaterThan(0);
      expect(highDensity.elapsedMs).toBeLessThan(lowDensity.elapsedMs * 10 + 600);
    } catch (error) {
      if (isGpuUnavailableError(error)) {
        warnAndSkipGpuUnavailable();
        return;
      }

      throw error;
    }
  });

  it("benchmarks lambda fallback strategy for particle counts", async () => {
    try {
      const lambdaFallback = await benchmarkRender({
        compositionId: "ParticleShowcase",
        frame: 50,
        iterations: 3,
        chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
        inputProps: {
          behavior: "orbit",
          count: 4000,
          environment: "lambda",
          seed: 42,
        },
      });

      // eslint-disable-next-line no-console
      console.log(
        `[benchmark] particles lambda-fallback=${lambdaFallback.elapsedMs.toFixed(2)}ms (${toEstimatedFps(lambdaFallback.elapsedMs).toFixed(2)} fps)`,
      );

      expect(lambdaFallback.elapsedMs).toBeGreaterThan(0);
      expect(lambdaFallback.elapsedMs).toBeLessThan(20_000);
    } catch (error) {
      if (isGpuUnavailableError(error)) {
        warnAndSkipGpuUnavailable();
        return;
      }

      throw error;
    }
  });
});
