import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/halftone.frag.glsl";

export const halftoneEffect: EffectDefinition = {
  type: "halftone",
  engine: "webgl",
  parameters: {
    scale: { kind: "number", default: 6, min: 1, max: 30 },
    angle: { kind: "number", default: 0.35, min: -6.2832, max: 6.2832 },
    threshold: { kind: "number", default: 0.55, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "halftone",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_scale: params.scale as number,
        u_angle: params.angle as number,
        u_threshold: params.threshold as number,
      },
    }),
};
