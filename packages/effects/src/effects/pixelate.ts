import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/pixelate.frag.glsl";

export const pixelateEffect: EffectDefinition = {
  type: "pixelate",
  engine: "webgl",
  parameters: {
    size: { kind: "number", default: 4, min: 1, max: 64 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "pixelate",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_pixel_size: params.size as number,
      },
    }),
};
