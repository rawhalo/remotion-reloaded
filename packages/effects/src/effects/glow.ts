import { createGlowFilter, normalizeColor } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";

export const glowEffect: EffectDefinition = {
  type: "glow",
  engine: "css",
  parameters: {
    color: { kind: "string", default: "#6366f1" },
    radius: { kind: "number", default: 20, min: 0, max: 100 },
  },
  build: (params, intensity) => ({
    cssFilter: createGlowFilter(
      normalizeColor(params.color as string, "#6366f1"),
      params.radius as number,
      intensity,
    ),
  }),
};
