import { describe, expect, it } from "vitest";
import { imageHash, pixelDiffStats } from "../utils/image-analysis";
import { renderFrameToBuffer } from "../utils/remotion";

describe("Combined GSAP + effects integration", () => {
  it("changes frame output over time when GSAP and preset are combined", async () => {
    const frame0 = await renderFrameToBuffer({
      compositionId: "CombinedShowcase",
      frame: 0,
    });
    const frame45 = await renderFrameToBuffer({
      compositionId: "CombinedShowcase",
      frame: 45,
    });

    const diff = pixelDiffStats(frame0, frame45);

    expect(diff.diffPixels).toBeGreaterThan(250);
  });

  it("renders deterministic output for the same target frame", async () => {
    const first = await renderFrameToBuffer({
      compositionId: "CombinedShowcase",
      frame: 45,
    });
    const second = await renderFrameToBuffer({
      compositionId: "CombinedShowcase",
      frame: 45,
    });

    expect(imageHash(first)).toBe(imageHash(second));
  });
});
