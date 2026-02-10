import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/godRays.frag.glsl";

export const godRaysEffect: EffectDefinition = {
  type: "godRays",
  engine: "webgl",
  parameters: {
    exposure: { kind: "number", default: 0.45, min: 0, max: 2 },
    decay: { kind: "number", default: 0.95, min: 0.5, max: 1 },
    density: { kind: "number", default: 0.85, min: 0, max: 2 },
    weight: { kind: "number", default: 0.45, min: 0, max: 2 },
    lightPositionX: { kind: "number", default: 0.5, min: 0, max: 1 },
    lightPositionY: { kind: "number", default: 0.35, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "godRays",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_exposure: params.exposure as number,
        u_decay: params.decay as number,
        u_density: params.density as number,
        u_weight: params.weight as number,
        u_light_position: [
          params.lightPositionX as number,
          params.lightPositionY as number,
        ],
      },
    }),
};
