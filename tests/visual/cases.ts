export interface VisualCase {
  compositionId: "CombinedShowcase" | "EffectsShowcase" | "GSAPFrameAccuracy";
  fileName: string;
  frame: number;
  inputProps?: Record<string, unknown>;
}

export const visualCases: readonly VisualCase[] = [
  {
    compositionId: "GSAPFrameAccuracy",
    fileName: "gsap-frame-30.png",
    frame: 30,
  },
  {
    compositionId: "EffectsShowcase",
    fileName: "effects-film-frame-0.png",
    frame: 0,
    inputProps: {
      effectType: "film",
      seed: 33,
    },
  },
  {
    compositionId: "CombinedShowcase",
    fileName: "combined-frame-45.png",
    frame: 45,
  },
] as const;
