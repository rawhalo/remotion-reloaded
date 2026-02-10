import type { EffectDefinition } from "../types";

export const noiseEffect: EffectDefinition = {
  type: "noise",
  engine: "svg",
  parameters: {
    amount: { kind: "number", default: 0.08, min: 0, max: 1 },
    baseFrequency: { kind: "number", default: 0.8, min: 0, max: 2 },
    octaves: { kind: "number", default: 2, min: 1, max: 8, integer: true },
    seed: { kind: "number", default: 42, min: 0, max: 9999, integer: true },
  },
  build: (params, intensity) => ({
    svgFilter: {
      kind: "noise",
      amount: (params.amount as number) * intensity,
      baseFrequency: params.baseFrequency as number,
      octaves: params.octaves as number,
      seed: params.seed as number,
    },
  }),
};
