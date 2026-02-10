import type { EffectDefinition } from "../types";

export const chromaticAberrationEffect: EffectDefinition = {
  type: "chromaticAberration",
  engine: "svg",
  parameters: {
    offset: { kind: "number", default: 2, min: 0, max: 20 },
    angle: { kind: "number", default: 0, min: -360, max: 360 },
  },
  build: (params, intensity) => ({
    svgFilter: {
      kind: "chromaticAberration",
      offset: (params.offset as number) * intensity,
      angle: params.angle as number,
    },
  }),
};
