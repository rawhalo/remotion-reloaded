import type { PresetEffectDescriptor } from "./types";

export const vintagePreset: readonly PresetEffectDescriptor[] = [
  {
    type: "sepia",
    amount: 0.55,
    intensity: 0.9,
  },
  {
    type: "noise",
    amount: 0.18,
    baseFrequency: 0.9,
    octaves: 2,
    seed: 33,
    intensity: 0.85,
  },
  {
    type: "vignette",
    darkness: 0.4,
    offset: 0.5,
    intensity: 0.8,
  },
];
