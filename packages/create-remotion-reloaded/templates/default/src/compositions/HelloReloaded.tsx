import { AbsoluteFill } from "remotion";
import { EffectPreset } from "@remotion-reloaded/effects";

export const HelloReloaded = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      }}
    >
      <EffectPreset name="cinematic" intensity={0.9}>
        <div style={{ textAlign: "center", padding: 56 }}>
          <h1 style={{ margin: 0, fontSize: 100, letterSpacing: "0.04em" }}>
            Remotion Reloaded
          </h1>
          <p style={{ marginTop: 18, fontSize: 34, opacity: 0.84 }}>
            Ship cinematic motion with deterministic renders.
          </p>
        </div>
      </EffectPreset>
    </AbsoluteFill>
  );
};
