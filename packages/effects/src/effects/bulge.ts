import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/bulge.frag.glsl";

export const bulgeEffect: EffectDefinition = {
  type: "bulge",
  engine: "webgl",
  parameters: {
    radius: { kind: "number", default: 0.35, min: 0.05, max: 1 },
    strength: { kind: "number", default: 0.85, min: -2, max: 2 },
    centerX: { kind: "number", default: 0.5, min: 0, max: 1 },
    centerY: { kind: "number", default: 0.5, min: 0, max: 1 },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "bulge",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_radius: params.radius as number,
        u_strength: params.strength as number,
        u_center: [params.centerX as number, params.centerY as number],
      },
    }),
};
