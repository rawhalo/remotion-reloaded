import { normalizeColor } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";

export const duotoneEffect: EffectDefinition = {
  type: "duotone",
  engine: "svg",
  parameters: {
    dark: { kind: "string", default: "#1a1a2e" },
    light: { kind: "string", default: "#e94560" },
  },
  build: (params, intensity) => ({
    svgFilter: {
      kind: "duotone",
      dark: normalizeColor(params.dark as string, "#1a1a2e"),
      light: normalizeColor(params.light as string, "#e94560"),
      intensity,
    },
  }),
};
