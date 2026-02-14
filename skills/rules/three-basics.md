# Three Basics

Use `@remotion-reloaded/three` for 3D scenes in Remotion.

## Core Rules

- Drive animation from `useCurrentFrame()`.
- Do not rely on R3F `useFrame()` loops for timeline-critical animation.
- Choose renderer explicitly: `webgpu` or `webgl`.

## Basic Scene

```tsx
import { ThreeCanvas } from '@remotion-reloaded/three';
import { interpolate, useCurrentFrame } from 'remotion';

const RotatingMesh = () => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 150], [0, Math.PI * 2]);

  return (
    <mesh rotation={[0.3, y, 0]}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color="#6366f1" metalness={0.4} roughness={0.25} />
    </mesh>
  );
};

export const ThreeIntro = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"
      camera={{ position: [0, 0, 5], fov: 45 }}
      onRendererResolved={(result) => {
        console.info('renderer', result.requested, '->', result.resolved);
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1} />
      <RotatingMesh />
    </ThreeCanvas>
  );
};
```

## Renderer Detection Helpers

```ts
import { detectWebGpuSupport, resolveRenderer } from '@remotion-reloaded/three';

const supported = await detectWebGpuSupport();
const resolved = resolveRenderer('webgpu', supported);
```

## Combining with `@remotion-reloaded/effects`

- CSS/SVG effects may work when wrapping `ThreeCanvas`, but advanced WebGL effects are not fully reliable in single-pass headless rendering.
- Prefer `@remotion-reloaded/three` postprocessing for 3D-first looks.
- For render-time safety, use `remotion-reloaded render --composition-id <id>` and let classifier routing decide single-pass vs pre-comp.
- Use explicit pre-comp only when you need direct source/effects composition control.
