import {
  Bloom,
  EffectComposer,
  GPUParticles,
  Noise,
  ThreeCanvas,
  Vignette,
} from "@remotion-reloaded/three";
import { interpolate, useCurrentFrame } from "remotion";

export const ParticleDemo = () => {
  const frame = useCurrentFrame();
  const bloomIntensity = interpolate(frame, [0, 90, 179], [0.25, 0.65, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ThreeCanvas
      renderer="auto"
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 4, 3]} intensity={1.1} color="#93c5fd" />

      <mesh rotation={[0.4, frame / 65, 0]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.45} roughness={0.2} />
      </mesh>

      <GPUParticles
        count={3500}
        behavior="orbit"
        renderer="auto"
        fallbackCount={750}
        color={["#93c5fd", "#a78bfa", "#f472b6"]}
        size={[0.03, 0.08]}
        opacity={0.85}
        config={{ radius: 2.6, speed: 0.42 }}
      />

      <EffectComposer>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.12} />
        <Noise opacity={0.015} />
        <Vignette darkness={0.45} offset={0.5} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
