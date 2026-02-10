import type { EffectDefinition } from "../types";

export const sepiaEffect: EffectDefinition = {
  type: "sepia",
  engine: "css",
  parameters: {
    amount: { kind: "number", default: 1, min: 0, max: 1 },
  },
  build: (params, intensity) => ({
    cssFilter: `sepia(${((params.amount as number) * intensity).toFixed(4)})`,
  }),
};
