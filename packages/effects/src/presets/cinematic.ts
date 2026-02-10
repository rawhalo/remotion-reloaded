import type { PresetEffectDescriptor } from "./types";

export const cinematicPreset: readonly PresetEffectDescriptor[] = [
  {
    type: "hueSaturation",
    hue: -4,
    saturation: -0.12,
    lightness: -0.04,
    intensity: 0.5,
  },
  {
    type: "film",
    grain: 0.1,
    sepia: 0.08,
    vignette: 0.3,
    seed: 17,
    intensity: 0.9,
  },
  {
    type: "vignette",
    darkness: 0.2,
    offset: 0.55,
    intensity: 0.7,
  },
];
