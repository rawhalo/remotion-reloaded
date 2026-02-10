import { normalizeColor } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";
import { buildWebglPlan, createNeonFallbackCss, parseColorToVector3 } from "./webglUtils";
import shader from "../shaders/neon.frag.glsl";

const DEFAULT_NEON_COLOR = "#00ffff";

export const neonEffect: EffectDefinition = {
  type: "neon",
  engine: "webgl",
  parameters: {
    color: { kind: "string", default: DEFAULT_NEON_COLOR },
    radius: { kind: "number", default: 12, min: 0, max: 60 },
    threshold: { kind: "number", default: 0.18, min: 0, max: 1 },
  },
  build: (params, intensity) => {
    const color = normalizeColor(params.color as string, DEFAULT_NEON_COLOR);
    const radius = params.radius as number;

    return buildWebglPlan({
      kind: "neon",
      shader,
      fallbackMode: "css",
      fallbackCssFilter: createNeonFallbackCss(color, radius, intensity),
      uniforms: {
        u_intensity: intensity,
        u_color: parseColorToVector3(color, DEFAULT_NEON_COLOR),
        u_radius: radius,
        u_threshold: params.threshold as number,
      },
    });
  },
};
