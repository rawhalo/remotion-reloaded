import { GPUParticles, ThreeCanvas } from '@remotion-reloaded/three';

export const ParticleBackground = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"
      camera={{ position: [0, 0, 7], fov: 50 }}
      width={1920}
      height={1080}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#030712']} />
      <ambientLight intensity={0.35} />

      <GPUParticles
        count={14000}
        behavior="flow-field"
        renderer="auto"
        seed={42}
        fallbackCount={1200}
        fallbackBehavior="simple"
        color={['#60a5fa', '#a78bfa', '#f472b6']}
        size={[0.02, 0.06]}
        opacity={0.9}
        config={{ speed: 1.7, curl: 0.85, noiseScale: 0.32 }}
      />
    </ThreeCanvas>
  );
};
