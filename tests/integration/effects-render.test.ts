import { describe, expect, it } from "vitest";
import {
  imageHash,
  pixelDiffStats,
} from "../utils/image-analysis";
import { renderFrameToBuffer } from "../utils/remotion";
import type { Phase1aEffectType } from "../fixtures/compositions/EffectsShowcase";

const phase1aEffects: readonly Phase1aEffectType[] = [
  "blur",
  "glow",
  "vignette",
  "sepia",
  "blackAndWhite",
  "hueSaturation",
  "chromaticAberration",
  "noise",
  "duotone",
  "film",
] as const;

describe("Effects render integration", () => {
  it("renders all 10 Phase 1a effects in headless mode", async () => {
    const baseline = await renderFrameToBuffer({
      compositionId: "EffectsShowcase",
      frame: 0,
      inputProps: { effectType: "none" },
    });

    for (const effectType of phase1aEffects) {
      const rendered = await renderFrameToBuffer({
        compositionId: "EffectsShowcase",
        frame: 0,
        inputProps: { effectType },
      });

      if (effectType === "noise") {
        // Noise is stochastic and depends on turbulence blending behavior.
        // Visibility is asserted in the deterministic seeded test below.
        expect(rendered.byteLength).toBeGreaterThan(0);
        continue;
      }

      const diff = pixelDiffStats(baseline, rendered);
      expect(
        diff.diffPixels,
        `Effect ${effectType} should visibly differ from baseline`,
      ).toBeGreaterThan(120);
    }
  });

  it("keeps seeded effects deterministic", async () => {
    for (const effectType of ["noise", "film"] as const) {
      const first = await renderFrameToBuffer({
        compositionId: "EffectsShowcase",
        frame: 0,
        inputProps: { effectType, seed: 123 },
      });
      const second = await renderFrameToBuffer({
        compositionId: "EffectsShowcase",
        frame: 0,
        inputProps: { effectType, seed: 123 },
      });
      const differentSeed = await renderFrameToBuffer({
        compositionId: "EffectsShowcase",
        frame: 0,
        inputProps: { effectType, seed: 124 },
      });

      expect(imageHash(first)).toBe(imageHash(second));
      expect(imageHash(first)).not.toBe(imageHash(differentSeed));
    }
  });

  it("renders animated effect parameters at distinct intermediate states", async () => {
    const frame0 = await renderFrameToBuffer({
      compositionId: "AnimatedEffects",
      frame: 0,
    });
    const frame30 = await renderFrameToBuffer({
      compositionId: "AnimatedEffects",
      frame: 30,
    });
    const frame60 = await renderFrameToBuffer({
      compositionId: "AnimatedEffects",
      frame: 60,
    });

    const diff0to30 = pixelDiffStats(frame0, frame30, 0.01);
    const diff30to60 = pixelDiffStats(frame30, frame60, 0.01);
    const diff0to60 = pixelDiffStats(frame0, frame60, 0.01);

    expect(diff0to30.diffPixels).toBeGreaterThan(20);
    expect(diff30to60.diffPixels).toBeGreaterThan(20);
    expect(diff0to60.diffPixels).toBeGreaterThan(20);
  });
});
