import { composeCssFilters } from "../engine/cssFilter";
import type { EffectDefinition } from "../types";

export const hueSaturationEffect: EffectDefinition = {
  type: "hueSaturation",
  engine: "css",
  parameters: {
    hue: { kind: "number", default: 0, min: -180, max: 180 },
    saturation: { kind: "number", default: 0, min: -1, max: 1 },
    lightness: { kind: "number", default: 0, min: -1, max: 1 },
  },
  build: (params, intensity) => {
    const hue = (params.hue as number) * intensity;
    const saturation = 1 + (params.saturation as number) * intensity;
    const brightness = 1 + (params.lightness as number) * intensity;

    return {
      cssFilter: composeCssFilters(
        `hue-rotate(${hue.toFixed(2)}deg)`,
        `saturate(${saturation.toFixed(4)})`,
        `brightness(${brightness.toFixed(4)})`,
      ),
    };
  },
};
