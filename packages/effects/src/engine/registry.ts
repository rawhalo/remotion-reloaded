import {
  UnknownEffectTypeError,
  warnClampedParameter,
  warnInvalidParameterType,
} from "../errors";
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
  createVignetteOverlay,
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
  blur: {
    type: "blur",
    engine: "css",
    parameters: {
      radius: { kind: "number", default: 8, min: 0, max: 200 },
    },
    build: (params, intensity) => ({
      cssFilter: `blur(${(numberValue(params, "radius") * intensity).toFixed(2)}px)`,
    }),
  },
  glow: {
    type: "glow",
    engine: "css",
    parameters: {
      color: { kind: "string", default: "#6366f1" },
      radius: { kind: "number", default: 20, min: 0, max: 100 },
    },
    build: (params, intensity) => ({
      cssFilter: createGlowFilter(
        normalizeColor(stringValue(params, "color"), "#6366f1"),
        numberValue(params, "radius"),
        intensity,
      ),
    }),
  },
  vignette: {
    type: "vignette",
    engine: "css",
    parameters: {
      darkness: { kind: "number", default: 0.4, min: 0, max: 1 },
      offset: { kind: "number", default: 0.5, min: 0, max: 1 },
    },
    build: (params, intensity) => ({
      overlayStyle: createVignetteOverlay(
        numberValue(params, "darkness") * intensity,
        numberValue(params, "offset"),
      ),
    }),
  },
  sepia: {
    type: "sepia",
    engine: "css",
    parameters: {
      amount: { kind: "number", default: 1, min: 0, max: 1 },
    },
    build: (params, intensity) => ({
      cssFilter: `sepia(${(numberValue(params, "amount") * intensity).toFixed(4)})`,
    }),
  },
  blackAndWhite: {
    type: "blackAndWhite",
    engine: "css",
    parameters: {
      amount: { kind: "number", default: 1, min: 0, max: 1 },
    },
    build: (params, intensity) => ({
      cssFilter: `grayscale(${(numberValue(params, "amount") * intensity).toFixed(4)})`,
    }),
  },
  hueSaturation: {
    type: "hueSaturation",
    engine: "css",
    parameters: {
      hue: { kind: "number", default: 0, min: -180, max: 180 },
      saturation: { kind: "number", default: 0, min: -1, max: 1 },
      lightness: { kind: "number", default: 0, min: -1, max: 1 },
    },
    build: (params, intensity) => {
      const hue = numberValue(params, "hue") * intensity;
      const saturation = 1 + numberValue(params, "saturation") * intensity;
      const brightness = 1 + numberValue(params, "lightness") * intensity;

      return {
        cssFilter: composeCssFilters(
          `hue-rotate(${hue.toFixed(2)}deg)`,
          `saturate(${saturation.toFixed(4)})`,
          `brightness(${brightness.toFixed(4)})`,
        ),
      };
    },
  },
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
  chromaticAberration: {
    type: "chromaticAberration",
    engine: "svg",
    parameters: {
      offset: { kind: "number", default: 2, min: 0, max: 20 },
      angle: { kind: "number", default: 0, min: -360, max: 360 },
    },
    build: (params, intensity) => ({
      svgFilter: {
        kind: "chromaticAberration",
        offset: numberValue(params, "offset") * intensity,
        angle: numberValue(params, "angle"),
      },
    }),
  },
  noise: {
    type: "noise",
    engine: "svg",
    parameters: {
      amount: { kind: "number", default: 0.08, min: 0, max: 1 },
      baseFrequency: { kind: "number", default: 0.8, min: 0, max: 2 },
      octaves: { kind: "number", default: 2, min: 1, max: 8, integer: true },
      seed: { kind: "number", default: 42, min: 0, max: 9999, integer: true },
    },
    build: (params, intensity) => ({
      svgFilter: {
        kind: "noise",
        amount: numberValue(params, "amount") * intensity,
        baseFrequency: numberValue(params, "baseFrequency"),
        octaves: numberValue(params, "octaves"),
        seed: numberValue(params, "seed"),
      },
    }),
  },
  duotone: {
    type: "duotone",
    engine: "svg",
    parameters: {
      dark: { kind: "string", default: "#1a1a2e" },
      light: { kind: "string", default: "#e94560" },
    },
    build: (params, intensity) => ({
      svgFilter: {
        kind: "duotone",
        dark: normalizeColor(stringValue(params, "dark"), "#1a1a2e"),
        light: normalizeColor(stringValue(params, "light"), "#e94560"),
        intensity,
      },
    }),
  },
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
  film: {
    type: "film",
    engine: "composite",
    parameters: {
      grain: { kind: "number", default: 0.08, min: 0, max: 1 },
      sepia: { kind: "number", default: 0.15, min: 0, max: 1 },
      seed: { kind: "number", default: 21, min: 0, max: 9999, integer: true },
      vignette: { kind: "number", default: 0.35, min: 0, max: 1 },
    },
    build: (params, intensity) => ({
      cssFilter: composeCssFilters(
        `sepia(${(numberValue(params, "sepia") * intensity).toFixed(4)})`,
        `contrast(${(1 + 0.05 * intensity).toFixed(4)})`,
      ),
      overlayStyle: createVignetteOverlay(
        numberValue(params, "vignette") * intensity,
        0.45,
      ),
      svgFilter: {
        kind: "noise",
        amount: numberValue(params, "grain") * intensity,
        baseFrequency: 1.1,
        octaves: 3,
        seed: numberValue(params, "seed"),
      },
    }),
  },
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
