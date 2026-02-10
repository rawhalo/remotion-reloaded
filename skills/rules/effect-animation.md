# Effect Parameter Animation

Animate effect props with Remotion frame values. Effects read props each frame.

## `interpolate()` Driven Animation

```tsx
import { interpolate, useCurrentFrame } from 'remotion';
import { Effect } from '@remotion-reloaded/effects';

const frame = useCurrentFrame();
const blur = interpolate(frame, [0, 40, 90], [0, 18, 2], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

<Effect type="blur" radius={blur}>
  <Content />
</Effect>;
```

## Multi-parameter Animation

```tsx
const frame = useCurrentFrame();
const jitter = interpolate(frame, [0, 30, 60], [0.1, 0.6, 0.2]);
const distortion = interpolate(frame, [0, 60], [0.2, 1.3]);

<Effect type="vhs" jitter={jitter} distortion={distortion} noise={0.45}>
  <Content />
</Effect>;
```

## Pairing with GSAP

Use GSAP for layout/transform choreography and effect props for look transitions.

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';

const { scopeRef } = useGSAP((tl) => {
  tl.from('.panel', { y: 60, opacity: 0, duration: 0.7 });
});
```

## Determinism Tips

- Keep `seed` fixed for `noise` / `film` when only strength should animate.
- Clamp interpolation ranges to avoid abrupt out-of-range changes.
