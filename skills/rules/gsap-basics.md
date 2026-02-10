# GSAP Basics

`useGSAP()` creates a paused GSAP timeline and seeks it to `frame / fps` every render frame.
This keeps output deterministic for Remotion preview and headless renders.

## Core Pattern

```tsx
import { AbsoluteFill } from 'remotion';
import { useGSAP } from 'remotion-reloaded';

export const Hero = ({ title }: { title: string }) => {
  const { scopeRef } = useGSAP(
    (timeline) => {
      timeline
        .from('.title', { y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('.line', { scaleX: 0, duration: 0.4 }, '-=0.2');
    },
    {
      dependencies: [title],
    },
  );

  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">{title}</h1>
      <div className="line" />
    </AbsoluteFill>
  );
};
```

## Important API Notes

- `useGSAP(callback, options)` requires a callback.
- Build timeline instructions inside the callback.
- Use `dependencies` when the timeline depends on props/state.
- Attach `scopeRef` to the wrapping element so selectors stay local.

## Declarative Timeline Components

```tsx
import {
  GSAPTimeline,
  GSAPFrom,
  GSAPTo,
  GSAPSequence,
} from 'remotion-reloaded';

<GSAPTimeline>
  <GSAPFrom target=".badge" duration={0.5} vars={{ y: -30, opacity: 0 }} />

  <GSAPSequence position="+=0.1">
    <GSAPTo target=".badge" duration={0.4} vars={{ scale: 1.08 }} />
    <GSAPTo target=".badge" duration={0.2} vars={{ scale: 1.0 }} />
  </GSAPSequence>

  <div className="badge">New</div>
</GSAPTimeline>
```

## Optional Club Plugin Registration

Use one of these patterns before plugin-dependent tweens:

```ts
import {
  registerMorphSVGPlugin,
  registerSplitTextPlugin,
  registerDrawSVGPlugin,
} from 'remotion-reloaded';

registerMorphSVGPlugin();
registerSplitTextPlugin();
registerDrawSVGPlugin();
```

Or bulk registration from the GSAP package:

```ts
import '@remotion-reloaded/gsap/register-all';
```

## Plugin-Safe Helpers

```ts
import { morphSVG, drawSVG, createSplitText } from 'remotion-reloaded';

timeline.to('#logo', { morphSVG: morphSVG('#logo-alt') });
timeline.from('.path', { drawSVG: drawSVG('0%'), duration: 1.2 });

const split = createSplitText('.headline', { type: 'chars' });
timeline.from(split.chars, { y: 20, opacity: 0, stagger: 0.02 });
```

## Common Mistakes

- Rebuilding timelines by putting GSAP code directly in render.
- Forgetting `dependencies` when timeline inputs change.
- Using unscoped selectors without `scopeRef`.
- Using Club plugin properties without registration.
