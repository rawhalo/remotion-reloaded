import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/wave.frag.glsl";

export const waveEffect: EffectDefinition = {
  type: "wave",
  engine: "webgl",
  parameters: {
    amplitude: { kind: "number", default: 0.75, min: 0, max: 3 },
    frequency: { kind: "number", default: 1, min: 0.1, max: 8 },
    speed: { kind: "number", default: 1, min: 0, max: 8 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "wave",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_amplitude: params.amplitude as number,
        u_frequency: params.frequency as number,
        u_speed: params.speed as number,
      },
    }),
};
