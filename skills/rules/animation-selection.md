# Animation Selection Guide

Use this guide to choose the simplest tool that fits the shot.

## Decision Order

1. Use `interpolate()` for single-property numeric tweens.
2. Use `spring()` for physics-style motion.
3. Use `useGSAP()` for multi-element choreography and precise sequencing.
4. Use `<GSAPTimeline>` when you want declarative timeline instructions in JSX.
5. Use `<Effect>` / `<EffectStack>` / `<EffectPreset>` for visual look treatment.

## 1) `interpolate()`

Best for straightforward fades, moves, scales, and counters.

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

## 2) `spring()`

Best for natural bouncy entrances/exits.

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

## 3) `useGSAP()`

Best for layered timelines and staggered choreography.

```tsx
import { AbsoluteFill } from 'remotion';
import { useGSAP } from 'remotion-reloaded';

const Scene = () => {
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

## 4) Declarative GSAP Timeline

Best when you want motion declared in JSX instead of timeline method chains.

```tsx
import { GSAPTimeline, GSAPFrom, GSAPTo } from 'remotion-reloaded';

<GSAPTimeline>
  <GSAPFrom target=".card" duration={0.6} vars={{ y: 40, opacity: 0 }} />
  <GSAPTo target=".card" duration={0.4} vars={{ scale: 1.05 }} />
  <div className="card">Card</div>
</GSAPTimeline>
```

## 5) Effects vs Motion

Use effects for look, not sequencing.

```tsx
import { EffectPreset } from 'remotion-reloaded';

<EffectPreset name="dream">
  <MyContent />
</EffectPreset>
```

## Plugin Note

GSAP Club plugins are optional. Register with either:
- `import '@remotion-reloaded/gsap/register-all'`, or
- targeted helpers (`registerMorphSVGPlugin`, `registerSplitTextPlugin`, `registerDrawSVGPlugin`).

## Scope Note

Three/WebGPU guidance is intentionally omitted here for Phase 1a. Those APIs are planned for Phase 1b.
