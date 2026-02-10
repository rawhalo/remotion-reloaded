import type { PresetEffectDescriptor } from "./types";

export const dreamPreset: readonly PresetEffectDescriptor[] = [
  {
    type: "glow",
    color: "#f0d8ff",
    radius: 24,
    intensity: 0.8,
  },
  {
    type: "hueSaturation",
    hue: 8,
    saturation: -0.35,
    lightness: 0.12,
    intensity: 0.75,
  },
  {
    type: "blur",
    radius: 3,
    intensity: 0.65,
  },
  {
    type: "vignette",
    darkness: 0.22,
    offset: 0.68,
    intensity: 0.5,
  },
];
