import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GPUParticles, ThreeCanvas } from "../../../packages/three/src/index";

type ParticleBehavior = "flow-field" | "explosion" | "orbit" | "attract";
type ParticleRenderer = "auto" | "webgl" | "webgpu";
type ParticleEnvironment = "local" | "lambda" | "cloud-run";

export interface ParticleShowcaseProps {
  behavior?: ParticleBehavior;
  count?: number;
  environment?: ParticleEnvironment;
  renderer?: ParticleRenderer;
  seed?: number;
}

export const ParticleShowcase: React.FC<ParticleShowcaseProps> = ({
  behavior = "orbit",
  count = 2400,
  environment,
  renderer = "auto",
  seed = 42,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <ThreeCanvas
        camera={{ position: [0, 0, 6.4], fov: 46 }}
        renderer="webgl"
        width={256}
        height={256}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#030712"]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 3, 3]} intensity={1.2} color="#93c5fd" />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#f472b6" />

        <GPUParticles
          behavior={behavior}
          color={["#60a5fa", "#a78bfa", "#f472b6"]}
          config={{
            curl: 0.85,
            gravity: 0.14,
            noiseScale: 0.32,
            radius: 2.5,
            speed: 1.3,
            strength: 1.2,
          }}
          count={count}
          environment={environment}
          fallbackBehavior="simple"
          fallbackCount={Math.min(600, count)}
          opacity={0.85}
          renderer={renderer}
          seed={seed}
          size={[0.03, 0.08]}
        />

        <mesh rotation={[frame / 80, frame / 56, 0]}>
          <icosahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive="#a855f7"
            emissiveIntensity={0.35}
            metalness={0.32}
            roughness={0.24}
          />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
