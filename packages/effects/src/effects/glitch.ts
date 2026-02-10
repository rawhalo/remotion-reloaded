import type { EffectDefinition } from "../types";
import { buildWebglPlan } from "./webglUtils";
import shader from "../shaders/glitch.frag.glsl";

export const glitchEffect: EffectDefinition = {
  type: "glitch",
  engine: "webgl",
  parameters: {
    strength: { kind: "number", default: 0.7, min: 0, max: 1 },
    blockSize: { kind: "number", default: 48, min: 4, max: 256 },
    seed: { kind: "number", default: 17, min: 0, max: 9999, integer: true },
  },
  build: (params, intensity) =>
    buildWebglPlan({
      kind: "glitch",
      shader,
      uniforms: {
        u_intensity: intensity,
        u_strength: params.strength as number,
        u_block_size: params.blockSize as number,
        u_seed: params.seed as number,
      },
    }),
};
