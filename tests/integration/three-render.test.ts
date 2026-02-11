import { describe, expect, it } from "vitest";
import { imageHash, pixelDiffStats } from "../utils/image-analysis";
import { isGpuUnavailableError, renderFrameToBuffer } from "../utils/remotion";

const ANGLE_CHROMIUM_OPTIONS = { gl: "angle" } as const;
let warnedGpuUnavailable = false;

function warnAndSkipGpuUnavailable(): void {
  if (warnedGpuUnavailable) {
    return;
  }

  warnedGpuUnavailable = true;
  // eslint-disable-next-line no-console
  console.warn(
    "Skipping Three.js integration assertions because WebGL is unavailable in this environment.",
  );
}

async function renderThreeFrame(options: {
  frame: number;
  inputProps?: Record<string, unknown>;
}): Promise<Buffer | null> {
  try {
    return await renderFrameToBuffer({
      compositionId: "ThreeRenderShowcase",
      frame: options.frame,
      inputProps: options.inputProps,
      chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
    });
  } catch (error) {
    if (isGpuUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

describe("Three.js render integration", () => {
  it("renders deterministic output for the same target frame", async () => {
    const first = await renderThreeFrame({ frame: 40 });
    const second = await renderThreeFrame({ frame: 40 });

    if (!first || !second) {
      warnAndSkipGpuUnavailable();
      return;
    }

    expect(imageHash(first)).toBe(imageHash(second));
  });

  it("changes visual output as the scene animates", async () => {
    const frame10 = await renderThreeFrame({ frame: 10 });
    const frame60 = await renderThreeFrame({ frame: 60 });

    if (!frame10 || !frame60) {
      warnAndSkipGpuUnavailable();
      return;
    }

    const diff = pixelDiffStats(frame10, frame60, 0.12);
    expect(diff.diffPixels).toBeGreaterThan(400);
  });

  it("renders with a webgpu request via runtime fallback behavior", async () => {
    const webGlRequested = await renderThreeFrame({
      frame: 45,
      inputProps: { renderer: "webgl" },
    });
    const webGpuRequested = await renderThreeFrame({
      frame: 45,
      inputProps: { renderer: "webgpu" },
    });

    if (!webGlRequested || !webGpuRequested) {
      warnAndSkipGpuUnavailable();
      return;
    }

    expect(webGlRequested.byteLength).toBeGreaterThan(0);
    expect(webGpuRequested.byteLength).toBeGreaterThan(0);
  });
});
