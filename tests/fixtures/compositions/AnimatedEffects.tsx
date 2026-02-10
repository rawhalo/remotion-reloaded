import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Effect } from "../../../packages/remotion-reloaded/src/index";

const paletteStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, #ef4444 0 33%, #22c55e 33% 66%, #3b82f6 66% 100%)",
  height: "100%",
  width: "100%",
};

export const AnimatedEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const hue = interpolate(frame, [0, 30, 60], [0, 60, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saturation = interpolate(frame, [0, 60], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Effect type="hueSaturation" hue={hue} saturation={saturation}>
      <div
        style={{
          backgroundColor: "#ffffff",
          height: 256,
          width: 256,
        }}
      >
        <div style={paletteStyle} />
      </div>
    </Effect>
  );
};
