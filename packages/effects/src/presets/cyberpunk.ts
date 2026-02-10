import type { PresetEffectDescriptor } from "./types";

export const cyberpunkPreset: readonly PresetEffectDescriptor[] = [
  {
    type: "neon",
    color: "#00f0ff",
    radius: 22,
    threshold: 0.2,
    intensity: 0.95,
  },
  {
    type: "glitch",
    strength: 0.62,
    blockSize: 54,
    seed: 137,
    intensity: 0.7,
  },
  {
    type: "contrast",
    amount: 1.45,
    intensity: 0.85,
  },
  {
    type: "hueSaturation",
    hue: -10,
    saturation: 0.32,
    lightness: 0.04,
    intensity: 0.7,
  },
];
