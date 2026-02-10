import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/radialBlur.frag.glsl";

export const radialBlurEffect: EffectDefinition = {
  type: "radialBlur",
  engine: "webgl",
  parameters: {
    strength: { kind: "number", default: 0.9, min: 0, max: 3 },
    samples: { kind: "number", default: 12, min: 1, max: 20, integer: true },
    centerX: { kind: "number", default: 0.5, min: 0, max: 1 },
    centerY: { kind: "number", default: 0.5, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "radialBlur",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_strength: params.strength as number,
        u_samples: params.samples as number,
        u_center: [params.centerX as number, params.centerY as number],
      },
    }),
};
