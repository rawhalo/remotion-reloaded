import type { PresetEffectDescriptor } from "./types";

export const retroVhsPreset: readonly PresetEffectDescriptor[] = [
  {
    type: "vhs",
    scanlines: 1.15,
    distortion: 0.75,
    jitter: 0.55,
    noise: 0.48,
    intensity: 0.95,
  },
  {
    type: "chromaticAberration",
    offset: 2.6,
    angle: 0,
    intensity: 0.55,
  },
  {
    type: "noise",
    amount: 0.14,
    baseFrequency: 0.95,
    octaves: 3,
    seed: 91,
    intensity: 0.65,
  },
  {
    type: "glitch",
    strength: 0.28,
    blockSize: 72,
    seed: 407,
    intensity: 0.45,
  },
];
