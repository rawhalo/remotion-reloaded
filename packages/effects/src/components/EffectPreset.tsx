import type { ReactElement, ReactNode } from "react";
import { Effect } from "./Effect";
import { EffectStack } from "./EffectStack";
import { cinematicPreset } from "../presets/cinematic";
import { dreamPreset } from "../presets/dream";
import type { PresetEffectDescriptor } from "../presets/types";
import { vintagePreset } from "../presets/vintage";
import type { EffectProps } from "../types";

export type PresetName = "cinematic" | "dream" | "vintage";

export interface EffectPresetProps {
  children: ReactNode;
  intensity?: number;
  name: PresetName;
}

const presetLayers: Record<PresetName, readonly PresetEffectDescriptor[]> = {
  cinematic: cinematicPreset,
  dream: dreamPreset,
  vintage: vintagePreset,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeIntensity(value: number | undefined): number {
  if (value === undefined) {
    return 1;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 1;
  }
  return clamp01(value);
}

/**
 * Apply a named combination of effects as a preset.
 */
export function EffectPreset({
  children,
  intensity,
  name,
}: EffectPresetProps): ReactElement | null {
  const layers = presetLayers[name];
  if (!layers) {
    throw new Error(
      `Unknown preset "${String(name)}". Available presets: ${Object.keys(
        presetLayers,
      ).join(", ")}`,
    );
  }

  const globalIntensity = normalizeIntensity(intensity);

  return (
    <EffectStack>
      {layers.map((layer, index) => {
        const { intensity: layerIntensity = 1, ...rawProps } = layer;
        const combinedIntensity = clamp01(
          normalizeIntensity(layerIntensity) * globalIntensity,
        );

        return (
          <Effect
            key={`preset-layer-${name}-${index}`}
            {...(rawProps as EffectProps)}
            intensity={combinedIntensity}
          />
        );
      })}
      {children}
    </EffectStack>
  );
}
