import {
  UnknownEffectTypeError,
  warnClampedParameter,
  warnInvalidParameterType,
} from "../errors";
import { blackAndWhiteEffect } from "../effects/blackAndWhite";
import { blurEffect } from "../effects/blur";
import { chromaticAberrationEffect } from "../effects/chromaticAberration";
import { duotoneEffect } from "../effects/duotone";
import { filmEffect } from "../effects/film";
import { glowEffect } from "../effects/glow";
import { hueSaturationEffect } from "../effects/hueSaturation";
import { noiseEffect } from "../effects/noise";
import { sepiaEffect } from "../effects/sepia";
import { vignetteEffect } from "../effects/vignette";
import type {
  BuiltInEffectType,
  EffectDefinition,
  EffectParameterDefinition,
  EffectType,
  ResolvedEffectPlan,
  ValidatedEffectParameters,
} from "../types";
import {
  composeCssFilters,
  createGlowFilter,
  normalizeColor,
} from "./cssFilter";

const DEFAULT_INTENSITY_MIN = 0;
const DEFAULT_INTENSITY_MAX = 1;
const DEFAULT_INTENSITY = 1;

function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) {
    next = Math.max(min, next);
  }
  if (max !== undefined) {
    next = Math.min(max, next);
  }
  return next;
}

function asNumber(
  rawValue: unknown,
  parameterName: string,
  effectType: EffectType,
  definition: Extract<EffectParameterDefinition, { kind: "number" }>,
): number {
  if (typeof rawValue !== "number" || Number.isNaN(rawValue)) {
    warnInvalidParameterType(
      effectType,
      parameterName,
      "number",
      rawValue,
      definition.default,
    );
    return definition.default;
  }

  const rounded = definition.integer ? Math.round(rawValue) : rawValue;
  const clamped = clamp(rounded, definition.min, definition.max);

  if (clamped !== rawValue) {
    warnClampedParameter(
      effectType,
      parameterName,
      rawValue,
      clamped,
      definition.min,
      definition.max,
    );
  }

  return clamped;
}

function asString(
  rawValue: unknown,
  parameterName: string,
  effectType: EffectType,
  definition: Extract<EffectParameterDefinition, { kind: "string" }>,
): string {
  if (typeof rawValue !== "string") {
    warnInvalidParameterType(
      effectType,
      parameterName,
      "string",
      rawValue,
      definition.default,
    );
    return definition.default;
  }
  return rawValue;
}

function asBoolean(
  rawValue: unknown,
  parameterName: string,
  effectType: EffectType,
  definition: Extract<EffectParameterDefinition, { kind: "boolean" }>,
): boolean {
  if (typeof rawValue !== "boolean") {
    warnInvalidParameterType(
      effectType,
      parameterName,
      "boolean",
      rawValue,
      definition.default,
    );
    return definition.default;
  }
  return rawValue;
}

function validateParameters(
  effectType: EffectType,
  rawParameters: Record<string, unknown>,
  definition: EffectDefinition,
): ValidatedEffectParameters {
  const validated: ValidatedEffectParameters = {};

  for (const [name, parameterDefinition] of Object.entries(definition.parameters)) {
    const rawValue = rawParameters[name];
    if (rawValue === undefined) {
      validated[name] = parameterDefinition.default;
      continue;
    }

    switch (parameterDefinition.kind) {
      case "number":
        validated[name] = asNumber(
          rawValue,
          name,
          effectType,
          parameterDefinition,
        );
        break;
      case "string":
        validated[name] = asString(
          rawValue,
          name,
          effectType,
          parameterDefinition,
        );
        break;
      case "boolean":
        validated[name] = asBoolean(
          rawValue,
          name,
          effectType,
          parameterDefinition,
        );
        break;
    }
  }

  return validated;
}

function getIntensity(
  effectType: EffectType,
  rawParameters: Record<string, unknown>,
): number {
  const rawIntensity = rawParameters.intensity;
  if (rawIntensity === undefined) {
    return DEFAULT_INTENSITY;
  }
  if (typeof rawIntensity !== "number" || Number.isNaN(rawIntensity)) {
    warnInvalidParameterType(
      effectType,
      "intensity",
      "number",
      rawIntensity,
      DEFAULT_INTENSITY,
    );
    return DEFAULT_INTENSITY;
  }

  const clamped = clamp(rawIntensity, DEFAULT_INTENSITY_MIN, DEFAULT_INTENSITY_MAX);
  if (clamped !== rawIntensity) {
    warnClampedParameter(
      effectType,
      "intensity",
      rawIntensity,
      clamped,
      DEFAULT_INTENSITY_MIN,
      DEFAULT_INTENSITY_MAX,
    );
  }
  return clamped;
}

function numberValue(
  params: ValidatedEffectParameters,
  key: string,
): number {
  return params[key] as number;
}

function stringValue(
  params: ValidatedEffectParameters,
  key: string,
): string {
  return params[key] as string;
}

const effectDefinitions: Record<BuiltInEffectType, EffectDefinition> = {
  blur: blurEffect,
  glow: glowEffect,
  vignette: vignetteEffect,
  sepia: sepiaEffect,
  blackAndWhite: blackAndWhiteEffect,
  hueSaturation: hueSaturationEffect,
  contrast: {
    type: "contrast",
    engine: "css",
    parameters: {
      amount: { kind: "number", default: 1, min: 0, max: 3 },
    },
    build: (params, intensity) => {
      const amount = numberValue(params, "amount");
      const adjusted = 1 + (amount - 1) * intensity;
      return { cssFilter: `contrast(${adjusted.toFixed(4)})` };
    },
  },
  invert: {
    type: "invert",
    engine: "css",
    parameters: {
      amount: { kind: "number", default: 1, min: 0, max: 1 },
    },
    build: (params, intensity) => ({
      cssFilter: `invert(${(numberValue(params, "amount") * intensity).toFixed(4)})`,
    }),
  },
  chromaticAberration: chromaticAberrationEffect,
  noise: noiseEffect,
  duotone: duotoneEffect,
  displacement: {
    type: "displacement",
    engine: "svg",
    parameters: {
      scale: { kind: "number", default: 12, min: 0, max: 100 },
      baseFrequency: { kind: "number", default: 0.03, min: 0, max: 1 },
      seed: { kind: "number", default: 7, min: 0, max: 9999, integer: true },
    },
    build: (params, intensity) => ({
      svgFilter: {
        kind: "displacement",
        scale: numberValue(params, "scale") * intensity,
        baseFrequency: numberValue(params, "baseFrequency"),
        seed: numberValue(params, "seed"),
      },
    }),
  },
  film: filmEffect,
  neon: {
    type: "neon",
    engine: "css",
    parameters: {
      color: { kind: "string", default: "#00ffff" },
      radius: { kind: "number", default: 12, min: 0, max: 60 },
    },
    build: (params, intensity) => {
      const color = normalizeColor(stringValue(params, "color"), "#00ffff");
      const radius = numberValue(params, "radius");
      return {
        cssFilter: composeCssFilters(
          createGlowFilter(color, radius, intensity),
          `brightness(${(1 + 0.2 * intensity).toFixed(4)})`,
          `saturate(${(1 + 0.4 * intensity).toFixed(4)})`,
        ),
      };
    },
  },
};

const availableEffectTypes = Object.keys(effectDefinitions).sort() as BuiltInEffectType[];

function getEffectDefinition(type: EffectType): EffectDefinition {
  const definition = effectDefinitions[type as BuiltInEffectType];
  if (!definition) {
    throw new UnknownEffectTypeError(type, availableEffectTypes);
  }
  return definition;
}

export function getAvailableEffectTypes(): readonly BuiltInEffectType[] {
  return availableEffectTypes;
}

export function resolveEffectPlan(
  type: EffectType,
  rawParameters: Record<string, unknown>,
): ResolvedEffectPlan {
  const definition = getEffectDefinition(type);
  const intensity = getIntensity(type, rawParameters);
  const validatedParameters = validateParameters(type, rawParameters, definition);
  return definition.build(validatedParameters, intensity);
}
