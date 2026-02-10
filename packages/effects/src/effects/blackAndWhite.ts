import type { EffectDefinition } from "../types";

export const blackAndWhiteEffect: EffectDefinition = {
  type: "blackAndWhite",
  engine: "css",
  parameters: {
    amount: { kind: "number", default: 1, min: 0, max: 1 },
  },
  build: (params, intensity) => ({
    cssFilter: `grayscale(${((params.amount as number) * intensity).toFixed(4)})`,
  }),
};
