import { describe, expect, it } from "vitest";
import { imageHash, pixelDiffStats } from "../utils/image-analysis";
import { isGpuUnavailableError, renderFrameToBuffer } from "../utils/remotion";

const ANGLE_CHROMIUM_OPTIONS = { gl: "angle" } as const;
const BEHAVIORS = ["flow-field", "explosion", "orbit", "attract"] as const;
let warnedGpuUnavailable = false;

function warnAndSkipGpuUnavailable(): void {
  if (warnedGpuUnavailable) {
    return;
  }

  warnedGpuUnavailable = true;
  // eslint-disable-next-line no-console
  console.warn(
    "Skipping particle integration assertions because WebGL is unavailable in this environment.",
  );
}

async function renderParticleFrame(inputProps: Record<string, unknown>): Promise<Buffer | null> {
  try {
    return await renderFrameToBuffer({
      compositionId: "ParticleShowcase",
      frame: 42,
      inputProps,
      chromiumOptions: ANGLE_CHROMIUM_OPTIONS,
    });
  } catch (error) {
    if (isGpuUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

describe("Particle render integration", () => {
  it("renders deterministic output for identical seed and behavior", async () => {
    const first = await renderParticleFrame({
      behavior: "orbit",
      count: 2400,
      seed: 77,
    });
    const second = await renderParticleFrame({
      behavior: "orbit",
      count: 2400,
      seed: 77,
    });

    if (!first || !second) {
      warnAndSkipGpuUnavailable();
      return;
    }

    expect(imageHash(first)).toBe(imageHash(second));
  });

  it("produces distinct frames for the four behavior modes", async () => {
    const hashes = new Set<string>();

    for (const behavior of BEHAVIORS) {
      const rendered = await renderParticleFrame({
        behavior,
        count: 2000,
        seed: 101,
      });

      if (!rendered) {
        warnAndSkipGpuUnavailable();
        return;
      }

      hashes.add(imageHash(rendered));
    }

    expect(hashes.size).toBe(BEHAVIORS.length);
  });

  it("changes visual density when particle count is reduced", async () => {
    const dense = await renderParticleFrame({
      behavior: "flow-field",
      count: 2600,
      seed: 42,
    });
    const sparse = await renderParticleFrame({
      behavior: "flow-field",
      count: 450,
      seed: 42,
    });

    if (!dense || !sparse) {
      warnAndSkipGpuUnavailable();
      return;
    }

    const diff = pixelDiffStats(dense, sparse, 0.16);
    expect(diff.diffPixels).toBeGreaterThan(300);
  });
});
