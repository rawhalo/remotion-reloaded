import type { CSSProperties, ReactNode } from "react";

export type BuiltInEffectType =
  | "blackAndWhite"
  | "blur"
  | "bulge"
  | "chromaticAberration"
  | "contrast"
  | "displacement"
  | "duotone"
  | "film"
  | "glitch"
  | "godRays"
  | "glow"
  | "halftone"
  | "hueSaturation"
  | "invert"
  | "lensFlare"
  | "motionBlur"
  | "neon"
  | "noise"
  | "pixelate"
  | "radialBlur"
  | "ripple"
  | "sepia"
  | "tiltShift"
  | "vignette"
  | "vhs"
  | "wave";

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

export interface GlitchEffectProps extends EffectComponentBaseProps {
  type: "glitch";
  blockSize?: number;
  seed?: number;
  strength?: number;
}

export interface WaveEffectProps extends EffectComponentBaseProps {
  type: "wave";
  amplitude?: number;
  frequency?: number;
  speed?: number;
}

export interface BulgeEffectProps extends EffectComponentBaseProps {
  type: "bulge";
  centerX?: number;
  centerY?: number;
  radius?: number;
  strength?: number;
}

export interface RippleEffectProps extends EffectComponentBaseProps {
  type: "ripple";
  amplitude?: number;
  centerX?: number;
  centerY?: number;
  frequency?: number;
  speed?: number;
}

export interface PixelateEffectProps extends EffectComponentBaseProps {
  type: "pixelate";
  size?: number;
}

export interface MotionBlurEffectProps extends EffectComponentBaseProps {
  type: "motionBlur";
  angle?: number;
  distance?: number;
  samples?: number;
}

export interface RadialBlurEffectProps extends EffectComponentBaseProps {
  type: "radialBlur";
  centerX?: number;
  centerY?: number;
  samples?: number;
  strength?: number;
}

export interface TiltShiftEffectProps extends EffectComponentBaseProps {
  type: "tiltShift";
  blur?: number;
  falloff?: number;
  focus?: number;
}

export interface VhsEffectProps extends EffectComponentBaseProps {
  type: "vhs";
  distortion?: number;
  jitter?: number;
  noise?: number;
  scanlines?: number;
}

export interface HalftoneEffectProps extends EffectComponentBaseProps {
  type: "halftone";
  angle?: number;
  scale?: number;
  threshold?: number;
}

export interface GodRaysEffectProps extends EffectComponentBaseProps {
  type: "godRays";
  decay?: number;
  density?: number;
  exposure?: number;
  lightPositionX?: number;
  lightPositionY?: number;
  weight?: number;
}

export interface LensFlareEffectProps extends EffectComponentBaseProps {
  type: "lensFlare";
  haloSize?: number;
  intensity?: number;
  lightPositionX?: number;
  lightPositionY?: number;
  streaks?: number;
}

export interface CustomEffectProps extends EffectComponentBaseProps {
  type: string & {};
  [key: string]: unknown;
}

export type EffectProps =
  | BlackAndWhiteEffectProps
  | BlurEffectProps
  | BulgeEffectProps
  | ChromaticAberrationEffectProps
  | ContrastEffectProps
  | CustomEffectProps
  | DisplacementEffectProps
  | DuotoneEffectProps
  | FilmEffectProps
  | GlitchEffectProps
  | GodRaysEffectProps
  | GlowEffectProps
  | HalftoneEffectProps
  | HueSaturationEffectProps
  | InvertEffectProps
  | LensFlareEffectProps
  | MotionBlurEffectProps
  | NeonEffectProps
  | NoiseEffectProps
  | PixelateEffectProps
  | RadialBlurEffectProps
  | RippleEffectProps
  | SepiaEffectProps
  | TiltShiftEffectProps
  | VhsEffectProps
  | VignetteEffectProps
  | WaveEffectProps;

export interface EffectStackProps {
  children?: ReactNode;
}

export type EffectEngine = "composite" | "css" | "svg" | "webgl";

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

export type AdvancedWebGLEffectType = Exclude<
  BuiltInEffectType,
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
  | "noise"
  | "sepia"
  | "vignette"
>;

export type WebGLUniformValue =
  | boolean
  | number
  | [number, number]
  | [number, number, number];

export interface WebGLFilterPlan {
  fallbackCssFilter?: string;
  fallbackMode: "css" | "skip";
  kind: AdvancedWebGLEffectType;
  shader: string;
  uniforms: Record<string, WebGLUniformValue>;
}

export interface ResolvedEffectPlan {
  cssFilter?: string;
  overlayStyle?: CSSProperties;
  svgFilter?: SVGFilterPlan;
  webglFilter?: WebGLFilterPlan;
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
