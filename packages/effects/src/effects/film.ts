import { composeCssFilters, createVignetteOverlay } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";

export const filmEffect: EffectDefinition = {
  type: "film",
  engine: "composite",
  parameters: {
    grain: { kind: "number", default: 0.08, min: 0, max: 1 },
    sepia: { kind: "number", default: 0.15, min: 0, max: 1 },
    seed: { kind: "number", default: 21, min: 0, max: 9999, integer: true },
    vignette: { kind: "number", default: 0.35, min: 0, max: 1 },
  },
  build: (params, intensity) => ({
    cssFilter: composeCssFilters(
      `sepia(${((params.sepia as number) * intensity).toFixed(4)})`,
      `contrast(${(1 + 0.05 * intensity).toFixed(4)})`,
    ),
    overlayStyle: createVignetteOverlay(
      (params.vignette as number) * intensity,
      0.45,
    ),
    svgFilter: {
      kind: "noise",
      amount: (params.grain as number) * intensity,
      baseFrequency: 1.1,
      octaves: 3,
      seed: params.seed as number,
    },
  }),
};
