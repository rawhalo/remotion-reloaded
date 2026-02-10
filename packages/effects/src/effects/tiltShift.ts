import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/tiltShift.frag.glsl";

export const tiltShiftEffect: EffectDefinition = {
  type: "tiltShift",
  engine: "webgl",
  parameters: {
    blur: { kind: "number", default: 6, min: 0, max: 30 },
    focus: { kind: "number", default: 0.5, min: 0, max: 1 },
    falloff: { kind: "number", default: 0.3, min: 0.01, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "tiltShift",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_blur: params.blur as number,
        u_focus: params.focus as number,
        u_falloff: params.falloff as number,
      },
    }),
};
