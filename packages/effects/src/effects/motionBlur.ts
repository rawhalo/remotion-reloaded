import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/motionBlur.frag.glsl";

export const motionBlurEffect: EffectDefinition = {
  type: "motionBlur",
  engine: "webgl",
  parameters: {
    distance: { kind: "number", default: 1.2, min: 0, max: 8 },
    angle: { kind: "number", default: 0, min: -6.2832, max: 6.2832 },
    samples: { kind: "number", default: 8, min: 1, max: 16, integer: true },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "motionBlur",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_distance: params.distance as number,
        u_angle: params.angle as number,
        u_samples: params.samples as number,
      },
    }),
};
