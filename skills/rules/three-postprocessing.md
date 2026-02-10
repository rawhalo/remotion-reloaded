# Three Post-Processing

Remotion Reloaded re-exports thin wrappers over `@react-three/postprocessing`.

## Components

- `<EffectComposer>`
- `<Bloom>`
- `<DepthOfField>`
- `<ChromaticAberration>`
- `<Vignette>`
- `<Noise>`

## Example Stack

```tsx
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  ThreeCanvas,
  Vignette,
} from '@remotion-reloaded/three';

<ThreeCanvas renderer="webgl" camera={{ position: [0, 0, 5], fov: 45 }}>
  <mesh>
    <sphereGeometry args={[1.1, 64, 64]} />
    <meshStandardMaterial color="#22d3ee" />
  </mesh>

  <EffectComposer>
    <Bloom intensity={0.65} luminanceThreshold={0.2} />
    <DepthOfField focusDistance={0.01} focalLength={0.035} bokehScale={2.2} />
    <ChromaticAberration offset={[0.0015, 0.0015]} />
    <Vignette darkness={0.45} offset={0.5} />
    <Noise opacity={0.02} />
  </EffectComposer>
</ThreeCanvas>;
```

## Notes

- Keep effect count minimal in dense scenes.
- Tune bloom and DOF first; add chromatic/noise late.
