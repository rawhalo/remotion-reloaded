import {
  ThreeCanvas,
} from '@remotion-reloaded/three';
import { interpolate, useCurrentFrame } from 'remotion';

const ProductMesh = () => {
  const frame = useCurrentFrame();
  const rotationY = interpolate(frame, [0, 179], [0, Math.PI * 2]);
  const rotationX = interpolate(frame, [0, 179], [0.2, 0.9]);

  return (
    <mesh rotation={[rotationX, rotationY, 0]}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial color="#818cf8" metalness={0.55} roughness={0.22} />
    </mesh>
  );
};

export const ProductShowcase = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"
      camera={{ position: [0, 0, 5], fov: 44 }}
      width={1920}
      height={1080}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#93c5fd" />
      <pointLight position={[-3, -2, 2]} intensity={0.7} color="#f472b6" />

      <ProductMesh />
    </ThreeCanvas>
  );
};
