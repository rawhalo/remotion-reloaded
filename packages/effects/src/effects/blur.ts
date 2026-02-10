import type { EffectDefinition } from "../types";

export const blurEffect: EffectDefinition = {
  type: "blur",
  engine: "css",
  parameters: {
    radius: { kind: "number", default: 8, min: 0, max: 200 },
  },
  build: (params, intensity) => ({
    cssFilter: `blur(${((params.radius as number) * intensity).toFixed(2)}px)`,
  }),
};
