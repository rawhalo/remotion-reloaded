import { createVignetteOverlay } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";

export const vignetteEffect: EffectDefinition = {
  type: "vignette",
  engine: "css",
  parameters: {
    darkness: { kind: "number", default: 0.4, min: 0, max: 1 },
    offset: { kind: "number", default: 0.5, min: 0, max: 1 },
  },
  build: (params, intensity) => ({
    overlayStyle: createVignetteOverlay(
      (params.darkness as number) * intensity,
      params.offset as number,
    ),
  }),
};
