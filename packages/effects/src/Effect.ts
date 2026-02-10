import type { ReactNode } from "react";

export type EffectType =
  | "blur"
  | "glow"
  | "chromaticAberration"
  | "noise"
  | "glitch"
  | "vignette"
  | "duotone"
  | "sepia"
  | "blackAndWhite"
  | "hueSaturation"
  | "contrast"
  | "invert"
  | "displacement"
  | "pixelate"
  | "filmGrain"
  | "bloom"
  | "motionBlur"
  | "distortion"
  | "halftone";

export interface EffectProps {
  type: EffectType;
  intensity?: number;
  children: ReactNode;
  [key: string]: unknown;
}

/**
 * Apply a visual effect to children.
 * Uses CSS/SVG filters for Phase 1a effects, WebGL for Phase 1b.
 */
export function Effect(_props: EffectProps): ReactNode {
  // TODO: Task 1.4 — full implementation
  // - Route to CSS filter, SVG filter, or WebGL pipeline based on effect type
  // - Animate intensity via useCurrentFrame + interpolate
  // - Fallback chain: WebGL → CSS/SVG → skip
  throw new Error(
    "Effect is not yet implemented. See Task 1.4 in the implementation plan.",
  );
}
