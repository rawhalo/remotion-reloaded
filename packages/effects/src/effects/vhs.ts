import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/vhs.frag.glsl";

export const vhsEffect: EffectDefinition = {
  type: "vhs",
  engine: "webgl",
  parameters: {
    scanlines: { kind: "number", default: 0.9, min: 0, max: 2 },
    distortion: { kind: "number", default: 0.65, min: 0, max: 2 },
    jitter: { kind: "number", default: 0.4, min: 0, max: 1 },
    noise: { kind: "number", default: 0.55, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "vhs",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_scanlines: params.scanlines as number,
        u_distortion: params.distortion as number,
        u_jitter: params.jitter as number,
        u_noise: params.noise as number,
      },
    }),
};
