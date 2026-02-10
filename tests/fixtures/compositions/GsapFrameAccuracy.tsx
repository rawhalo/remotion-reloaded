import React from "react";
import { AbsoluteFill } from "remotion";
import { useGSAP } from "../../../packages/remotion-reloaded/src/index";

export const GsapFrameAccuracy: React.FC = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline.to(".box", {
      duration: 1,
      ease: "none",
      x: 120,
    });
  });

  return (
    <AbsoluteFill ref={scopeRef} style={{ backgroundColor: "#ffffff" }}>
      <div
        className="box"
        style={{
          backgroundColor: "#ff0000",
          height: 40,
          left: 40,
          position: "absolute",
          top: 108,
          width: 40,
        }}
      />
    </AbsoluteFill>
  );
};
