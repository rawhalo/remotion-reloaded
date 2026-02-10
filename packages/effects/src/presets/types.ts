import type { BuiltInEffectType } from "../types";

export interface PresetEffectDescriptor {
  intensity?: number;
  type: BuiltInEffectType;
  [parameter: string]: unknown;
}
