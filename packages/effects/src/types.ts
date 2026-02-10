import type { CSSProperties, ReactNode } from "react";

export type BuiltInEffectType =
  | "blackAndWhite"
  | "blur"
  | "chromaticAberration"
  | "contrast"
  | "displacement"
  | "duotone"
  | "film"
  | "glow"
  | "hueSaturation"
  | "invert"
  | "neon"
  | "noise"
  | "sepia"
  | "vignette";

export type EffectType = BuiltInEffectType | (string & {});

interface EffectComponentBaseProps {
  children?: ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
}

export interface BlurEffectProps extends EffectComponentBaseProps {
  type: "blur";
  radius?: number;
}

export interface GlowEffectProps extends EffectComponentBaseProps {
  type: "glow";
  color?: string;
  radius?: number;
}

export interface VignetteEffectProps extends EffectComponentBaseProps {
  type: "vignette";
  darkness?: number;
  offset?: number;
}

export interface SepiaEffectProps extends EffectComponentBaseProps {
  type: "sepia";
  amount?: number;
}

export interface BlackAndWhiteEffectProps extends EffectComponentBaseProps {
  type: "blackAndWhite";
  amount?: number;
}

export interface HueSaturationEffectProps extends EffectComponentBaseProps {
  type: "hueSaturation";
  hue?: number;
  lightness?: number;
  saturation?: number;
}

export interface ContrastEffectProps extends EffectComponentBaseProps {
  type: "contrast";
  amount?: number;
}

export interface InvertEffectProps extends EffectComponentBaseProps {
  type: "invert";
  amount?: number;
}

export interface ChromaticAberrationEffectProps extends EffectComponentBaseProps {
  type: "chromaticAberration";
  angle?: number;
  offset?: number;
}

export interface NoiseEffectProps extends EffectComponentBaseProps {
  type: "noise";
  amount?: number;
  baseFrequency?: number;
  octaves?: number;
  seed?: number;
}

export interface DuotoneEffectProps extends EffectComponentBaseProps {
  type: "duotone";
  dark?: string;
  light?: string;
}

export interface DisplacementEffectProps extends EffectComponentBaseProps {
  type: "displacement";
  baseFrequency?: number;
  scale?: number;
  seed?: number;
}

export interface FilmEffectProps extends EffectComponentBaseProps {
  type: "film";
  grain?: number;
  seed?: number;
  sepia?: number;
  vignette?: number;
}

export interface NeonEffectProps extends EffectComponentBaseProps {
  type: "neon";
  color?: string;
  radius?: number;
}

export interface CustomEffectProps extends EffectComponentBaseProps {
  type: string & {};
  [key: string]: unknown;
}

export type EffectProps =
  | BlackAndWhiteEffectProps
  | BlurEffectProps
  | ChromaticAberrationEffectProps
  | ContrastEffectProps
  | CustomEffectProps
  | DisplacementEffectProps
  | DuotoneEffectProps
  | FilmEffectProps
  | GlowEffectProps
  | HueSaturationEffectProps
  | InvertEffectProps
  | NeonEffectProps
  | NoiseEffectProps
  | SepiaEffectProps
  | VignetteEffectProps;

export interface EffectStackProps {
  children?: ReactNode;
}

export type EffectEngine = "composite" | "css" | "svg";

export interface NumberParameterDefinition {
  default: number;
  integer?: boolean;
  kind: "number";
  max?: number;
  min?: number;
}

export interface StringParameterDefinition {
  default: string;
  kind: "string";
}

export interface BooleanParameterDefinition {
  default: boolean;
  kind: "boolean";
}

export type EffectParameterDefinition =
  | BooleanParameterDefinition
  | NumberParameterDefinition
  | StringParameterDefinition;

export type EffectParameterDefinitions = Record<string, EffectParameterDefinition>;

export type ValidatedEffectParameters = Record<string, boolean | number | string>;

export type SVGFilterPlan =
  | {
      angle: number;
      kind: "chromaticAberration";
      offset: number;
    }
  | {
      amount: number;
      baseFrequency: number;
      kind: "noise";
      octaves: number;
      seed: number;
    }
  | {
      dark: string;
      intensity: number;
      kind: "duotone";
      light: string;
    }
  | {
      baseFrequency: number;
      kind: "displacement";
      scale: number;
      seed: number;
    };

export interface ResolvedEffectPlan {
  cssFilter?: string;
  overlayStyle?: CSSProperties;
  svgFilter?: SVGFilterPlan;
  wrapperStyle?: CSSProperties;
}

export interface EffectDefinition {
  build: (
    params: ValidatedEffectParameters,
    intensity: number,
  ) => ResolvedEffectPlan;
  engine: EffectEngine;
  parameters: EffectParameterDefinitions;
  type: BuiltInEffectType;
}
