# GSAP Basics

`useGSAP()` creates a paused timeline and seeks it to `frame / fps` every render.
This keeps output deterministic for preview and headless rendering.

## Core Pattern

```tsx
import { AbsoluteFill } from 'remotion';
import { useGSAP } from '@remotion-reloaded/gsap';

export const Hero = ({ title }: { title: string }) => {
  const { scopeRef } = useGSAP(
    (timeline) => {
      timeline
        .from('.title', { y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('.line', { scaleX: 0, duration: 0.4 }, '-=0.2');
    },
    { dependencies: [title] },
  );

  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">{title}</h1>
      <div className="line" />
    </AbsoluteFill>
  );
};
```

## Declarative Timeline Components

```tsx
import { GSAPTimeline, GSAPFrom, GSAPTo, GSAPSequence } from '@remotion-reloaded/gsap';

<GSAPTimeline>
  <GSAPFrom target=".card" duration={0.6} vars={{ y: 40, opacity: 0 }} />

  <GSAPSequence position="+=0.1">
    <GSAPTo target=".card" duration={0.25} vars={{ scale: 1.06 }} />
    <GSAPTo target=".card" duration={0.2} vars={{ scale: 1.0 }} />
  </GSAPSequence>

  <div className="card">Card</div>
</GSAPTimeline>
```

## Target Lifecycle Contract

GSAP targets should exist at frame 0. Prefer keeping elements mounted and controlling visibility/opacity over conditional mounting that delays target creation.

## Common Mistakes

- Building timelines directly in render.
- Omitting `dependencies` when timeline inputs change.
- Unscoped selectors without `scopeRef`.
- Using plugin properties without registration.
