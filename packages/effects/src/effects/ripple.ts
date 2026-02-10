import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/ripple.frag.glsl";

export const rippleEffect: EffectDefinition = {
  type: "ripple",
  engine: "webgl",
  parameters: {
    amplitude: { kind: "number", default: 0.65, min: 0, max: 2 },
    frequency: { kind: "number", default: 2, min: 0.1, max: 12 },
    speed: { kind: "number", default: 1.1, min: 0, max: 8 },
    centerX: { kind: "number", default: 0.5, min: 0, max: 1 },
    centerY: { kind: "number", default: 0.5, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "ripple",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_amplitude: params.amplitude as number,
        u_frequency: params.frequency as number,
        u_speed: params.speed as number,
        u_center: [params.centerX as number, params.centerY as number],
      },
    }),
};
