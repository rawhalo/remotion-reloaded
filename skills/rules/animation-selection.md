# Animation Selection Guide

Use this order to choose the lowest-complexity tool that still fits the shot.

## Decision Order

1. `interpolate()` for direct numeric tweens.
2. `spring()` for physically eased motion.
3. `useGSAP()` for sequenced choreography and staggered timelines.
4. `<GSAPTimeline>` for declarative timeline instructions in JSX.
5. `<Effect>` / `<EffectStack>` / `<EffectPreset>` for visual treatment.
6. `@remotion-reloaded/three` for 3D scenes, particles, and post-processing.

## Simple Numeric Motion

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

## Physics Motion

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  fps,
  frame,
  config: { damping: 14, stiffness: 120 },
});
```

## Timeline Choreography

```tsx
import { AbsoluteFill } from 'remotion';
import { useGSAP } from '@remotion-reloaded/gsap';

export const Scene = () => {
  const { scopeRef } = useGSAP((tl) => {
    tl.from('.title', { y: 80, opacity: 0, duration: 0.8 })
      .from('.subtitle', { opacity: 0, duration: 0.5 }, '-=0.3');
  });

  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">Title</h1>
      <p className="subtitle">Subtitle</p>
    </AbsoluteFill>
  );
};
```

## Visual Treatment

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

<EffectPreset name="cyberpunk" intensity={0.8}>
  <Content />
</EffectPreset>;
```

## Three.js Workloads

Use `@remotion-reloaded/three` when the shot needs:
- true 3D geometry or lighting
- particle simulation (`<GPUParticles>`)
- post-processing stack (`<EffectComposer>`, `<Bloom>`, etc.)

Avoid using R3F `useFrame()` in Remotion compositions. Drive animation from `useCurrentFrame()`.
