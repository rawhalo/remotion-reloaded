import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { pixelDiffStats } from "../utils/image-analysis";
import { isGpuUnavailableError, renderFrameToBuffer } from "../utils/remotion";
import { visualCases } from "./cases";

const currentFile = fileURLToPath(import.meta.url);
const snapshotDir = path.resolve(path.dirname(currentFile), "snapshots");

describe("Visual regression snapshots", () => {
  for (const visualCase of visualCases) {
    it(`matches baseline: ${visualCase.fileName}`, async () => {
      const baselinePath = path.join(snapshotDir, visualCase.fileName);
      let baselineBuffer: Buffer;

      try {
        baselineBuffer = await fs.readFile(baselinePath);
      } catch {
        throw new Error(
          `Missing baseline snapshot: ${baselinePath}. Run pnpm test:visual:update`,
        );
      }

      let rendered: Buffer;

      try {
        rendered = await renderFrameToBuffer({
          compositionId: visualCase.compositionId,
          frame: visualCase.frame,
          inputProps: visualCase.inputProps,
          chromiumOptions: visualCase.chromiumOptions,
        });
      } catch (error) {
        if (visualCase.skipOnGpuUnavailable && isGpuUnavailableError(error)) {
          // eslint-disable-next-line no-console
          console.warn(
            `Skipping visual assertion for ${visualCase.fileName} because WebGL is unavailable in this environment.`,
          );
          return;
        }

        throw error;
      }

      const diff = pixelDiffStats(
        baselineBuffer,
        rendered,
        visualCase.pixelmatchThreshold ?? 0.12,
      );

      // Keep tolerance low but non-zero for anti-aliasing variance.
      expect(diff.ratio).toBeLessThanOrEqual(visualCase.diffRatioThreshold ?? 0.003);
    });
  }
});
