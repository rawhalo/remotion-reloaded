import type { ChromiumOptions } from "@remotion/renderer";

export interface VisualCase {
  compositionId:
    | "CombinedShowcase"
    | "EffectsShowcase"
    | "GSAPFrameAccuracy"
    | "ParticleShowcase"
    | "ThreeRenderShowcase";
  fileName: string;
  frame: number;
  inputProps?: Record<string, unknown>;
  chromiumOptions?: ChromiumOptions;
  pixelmatchThreshold?: number;
  diffRatioThreshold?: number;
  skipOnGpuUnavailable?: boolean;
}

export const visualCases: readonly VisualCase[] = [
  {
    compositionId: "GSAPFrameAccuracy",
    fileName: "gsap-frame-30.png",
    frame: 30,
    diffRatioThreshold: 0.003,
  },
  {
    compositionId: "EffectsShowcase",
    fileName: "effects-film-frame-0.png",
    frame: 0,
    inputProps: {
      effectType: "film",
      seed: 33,
    },
    diffRatioThreshold: 0.003,
  },
  {
    compositionId: "CombinedShowcase",
    fileName: "combined-frame-45.png",
    frame: 45,
    diffRatioThreshold: 0.003,
  },
  {
    compositionId: "ThreeRenderShowcase",
    fileName: "three-frame-45.png",
    frame: 45,
    chromiumOptions: {
      gl: "angle",
    },
    pixelmatchThreshold: 0.16,
    diffRatioThreshold: 0.01,
    skipOnGpuUnavailable: true,
  },
  {
    compositionId: "ParticleShowcase",
    fileName: "particles-orbit-frame-42.png",
    frame: 42,
    inputProps: {
      behavior: "orbit",
      count: 2400,
      seed: 42,
    },
    chromiumOptions: {
      gl: "angle",
    },
    pixelmatchThreshold: 0.18,
    diffRatioThreshold: 0.014,
    skipOnGpuUnavailable: true,
  },
] as const;
