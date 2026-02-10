import {
  getRenderEnvironment,
  type RenderEnvironment,
} from "@remotion-reloaded/config";

type WebglPowerPreference = "default" | "high-performance" | "low-power";

export type ThreeQualityPresetName = "auto" | "high" | "medium" | "low" | "lambda";

export interface ThreeQualityPreset {
  name: Exclude<ThreeQualityPresetName, "auto">;
  dpr: number | [number, number];
  shadows: boolean;
  gl: {
    antialias: boolean;
    powerPreference: WebglPowerPreference;
    failIfMajorPerformanceCaveat: boolean;
  };
}

interface ResolveThreeQualityPresetOptions {
  quality?: ThreeQualityPresetName;
  lambdaQuality?: Exclude<ThreeQualityPresetName, "auto">;
  environment?: RenderEnvironment;
}

export interface ResolvedThreeQualityPreset {
  environment: RenderEnvironment;
  preset: ThreeQualityPreset;
}

const PRESETS: Record<Exclude<ThreeQualityPresetName, "auto">, ThreeQualityPreset> = {
  high: {
    name: "high",
    dpr: 1,
    shadows: true,
    gl: {
      antialias: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    },
  },
  medium: {
    name: "medium",
    dpr: 0.85,
    shadows: true,
    gl: {
      antialias: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    },
  },
  low: {
    name: "low",
    dpr: 0.7,
    shadows: false,
    gl: {
      antialias: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    },
  },
  lambda: {
    name: "lambda",
    dpr: 0.5,
    shadows: false,
    gl: {
      antialias: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    },
  },
};

const clonePreset = (preset: ThreeQualityPreset): ThreeQualityPreset => ({
  ...preset,
  gl: {
    ...preset.gl,
  },
});

const getEffectivePresetName = ({
  quality = "auto",
  lambdaQuality = "lambda",
  environment = getRenderEnvironment(),
}: ResolveThreeQualityPresetOptions): Exclude<ThreeQualityPresetName, "auto"> => {
  if (quality !== "auto") {
    return quality;
  }

  if (environment === "lambda") {
    return lambdaQuality;
  }

  return "high";
};

export function resolveThreeQualityPreset(
  options: ResolveThreeQualityPresetOptions = {},
): ResolvedThreeQualityPreset {
  const environment = options.environment ?? getRenderEnvironment();
  const presetName = getEffectivePresetName({
    ...options,
    environment,
  });

  return {
    environment,
    preset: clonePreset(PRESETS[presetName]),
  };
}
