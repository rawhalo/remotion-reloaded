import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/lensFlare.frag.glsl";

export const lensFlareEffect: EffectDefinition = {
  type: "lensFlare",
  engine: "webgl",
  parameters: {
    intensity: { kind: "number", default: 0.6, min: 0, max: 2 },
    haloSize: { kind: "number", default: 0.3, min: 0.01, max: 1 },
    streaks: { kind: "number", default: 6, min: 1, max: 12 },
    lightPositionX: { kind: "number", default: 0.6, min: 0, max: 1 },
    lightPositionY: { kind: "number", default: 0.4, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "lensFlare",
      shader,
      uniforms: {
        u_intensity: (params.intensity as number) * intensity,
        u_halo_size: params.haloSize as number,
        u_streaks: params.streaks as number,
        u_light_position: [
          params.lightPositionX as number,
          params.lightPositionY as number,
        ],
      },
    }),
};
