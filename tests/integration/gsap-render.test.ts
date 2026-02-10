import { describe, expect, it } from "vitest";
import { findRedBoxLeftX, imageHash } from "../utils/image-analysis";
import { renderFrameToBuffer } from "../utils/remotion";

describe("GSAP render integration", () => {
  it("reaches target position with ±1 frame tolerance", async () => {
    const frame29 = await renderFrameToBuffer({
      compositionId: "GSAPFrameAccuracy",
      frame: 29,
    });
    const frame30 = await renderFrameToBuffer({
      compositionId: "GSAPFrameAccuracy",
      frame: 30,
    });
    const frame31 = await renderFrameToBuffer({
      compositionId: "GSAPFrameAccuracy",
      frame: 31,
    });

    const x29 = findRedBoxLeftX(frame29);
    const x30 = findRedBoxLeftX(frame30);
    const x31 = findRedBoxLeftX(frame31);

    expect(x29).toBeLessThan(x30);

    // Initial left=40 and GSAP x target=120, so expected left edge is 160.
    expect(Math.abs(x30 - 160)).toBeLessThanOrEqual(2);
    expect(Math.abs(x31 - 160)).toBeLessThanOrEqual(2);
  });

  it("is deterministic for direct frame seeks", async () => {
    const first = await renderFrameToBuffer({
      compositionId: "GSAPFrameAccuracy",
      frame: 45,
    });
    const second = await renderFrameToBuffer({
      compositionId: "GSAPFrameAccuracy",
      frame: 45,
    });

    expect(imageHash(first)).toBe(imageHash(second));
  });
});
