import React from "react";
import {
  EffectPreset,
  useGSAP,
} from "../../../packages/remotion-reloaded/src/index";

export const CombinedShowcase: React.FC = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline
      .from(".panel", {
        duration: 0.9,
        ease: "none",
        opacity: 0,
        y: 50,
      })
      .to(
        ".badge",
        {
          duration: 0.8,
          ease: "none",
          x: 80,
        },
        0.4,
      );
  });

  return (
    <EffectPreset name="cinematic" intensity={0.9}>
      <div
        ref={scopeRef}
        style={{
          alignItems: "center",
          backgroundColor: "#111827",
          display: "flex",
          height: 256,
          justifyContent: "center",
          position: "relative",
          width: 256,
        }}
      >
        <div
          className="panel"
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)",
            borderRadius: 24,
            height: 120,
            width: 180,
          }}
        />
        <div
          className="badge"
          style={{
            backgroundColor: "#ef4444",
            borderRadius: 999,
            height: 32,
            left: 36,
            position: "absolute",
            top: 36,
            width: 32,
          }}
        />
      </div>
    </EffectPreset>
  );
};
