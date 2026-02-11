import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "../../../packages/three/src/index";

export interface ThreeRenderShowcaseProps {
  renderer?: "webgl" | "webgpu";
}

export const ThreeRenderShowcase: React.FC<ThreeRenderShowcaseProps> = ({
  renderer = "webgl",
}) => {
  const frame = useCurrentFrame();
  const rotationY = interpolate(frame, [0, 44, 89], [0, Math.PI, Math.PI * 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ThreeCanvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        renderer={renderer}
        width={256}
        height={256}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.32} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#93c5fd" />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#a78bfa" />

        <mesh rotation={[0.35, rotationY, 0.1]}>
          <torusKnotGeometry args={[0.8, 0.24, 192, 32]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#312e81"
            emissiveIntensity={0.22}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#0b1120" roughness={0.9} metalness={0.08} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
