import React from "react";
import { Effect } from "../../../packages/remotion-reloaded/src/index";

export type Phase1aEffectType =
  | "blackAndWhite"
  | "blur"
  | "chromaticAberration"
  | "duotone"
  | "film"
  | "glow"
  | "hueSaturation"
  | "noise"
  | "sepia"
  | "vignette";

export interface EffectsShowcaseProps {
  effectType: Phase1aEffectType | "none";
  seed?: number;
}

const defaultSeed = 42;

const sceneStyle: React.CSSProperties = {
  alignItems: "center",
  background:
    "repeating-linear-gradient(45deg, #0f172a 0 12px, #1d4ed8 12px 24px, #14b8a6 24px 36px)",
  display: "flex",
  justifyContent: "center",
  height: 256,
  width: 256,
};

const targetStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #111827 0%, #f59e0b 100%)",
  border: "4px solid #ffffff",
  borderRadius: 24,
  boxShadow: "0 0 0 6px rgba(0, 0, 0, 0.2)",
  height: 140,
  width: 140,
};

function getEffectProps(
  effectType: Phase1aEffectType,
  seed: number,
): Record<string, unknown> {
  switch (effectType) {
    case "blackAndWhite":
      return { amount: 1 };
    case "blur":
      return { radius: 8 };
    case "chromaticAberration":
      return { angle: 20, offset: 3 };
    case "duotone":
      return { dark: "#111827", light: "#f59e0b" };
    case "film":
      return { grain: 0.14, seed, sepia: 0.2, vignette: 0.35 };
    case "glow":
      return { color: "#a855f7", radius: 20 };
    case "hueSaturation":
      return { hue: 18, lightness: -0.1, saturation: -0.2 };
    case "noise":
      return { amount: 0.2, baseFrequency: 0.9, octaves: 3, seed };
    case "sepia":
      return { amount: 0.7 };
    case "vignette":
      return { darkness: 0.45, offset: 0.55 };
    default:
      return {};
  }
}

function EffectTarget(): React.ReactElement {
  return <div style={targetStyle} />;
}

export const EffectsShowcase: React.FC<EffectsShowcaseProps> = ({
  effectType,
  seed = defaultSeed,
}) => {
  const content = <EffectTarget />;

  if (effectType === "none") {
    return <div style={sceneStyle}>{content}</div>;
  }

  const effectProps = getEffectProps(effectType, seed);

  return (
    <div style={sceneStyle}>
      {React.createElement(
        Effect as React.ComponentType<Record<string, unknown>>,
        {
          ...effectProps,
          type: effectType,
        },
        content,
      )}
    </div>
  );
};
