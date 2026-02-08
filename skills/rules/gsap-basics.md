# GSAP Basics

## Core Concept

GSAP (GreenSock Animation Platform) provides timeline-based animations that sync with Remotion's frame-based rendering via the `useGSAP()` hook.

**Key principle:** Build the timeline once in `useEffect()`, and the hook automatically seeks to the correct position based on `useCurrentFrame()`.

---

## The useGSAP Hook

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { AbsoluteFill } from 'remotion';
import { useEffect } from 'react';

export const MyComposition: React.FC = () => {
  const { timeline, scopeRef } = useGSAP();

  useEffect(() => {
    // Build timeline ONCE on mount
    timeline
      .from('.title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('.subtitle', {
        y: 50,
        opacity: 0,
        duration: 0.8
      }, '-=0.5');  // Overlap by 0.5 seconds
  }, []);  // Empty deps = runs once

  // scopeRef limits GSAP selectors to this component
  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">Hello World</h1>
      <p className="subtitle">Welcome to Remotion Reloaded</p>
    </AbsoluteFill>
  );
};
```

---

## Timeline Methods

### `.from()` — Animate FROM values

```tsx
// Element starts at y:100, opacity:0 and animates to its natural state
timeline.from('.element', {
  y: 100,
  opacity: 0,
  duration: 1
});
```

### `.to()` — Animate TO values

```tsx
// Element animates from its current state to scale:1.2
timeline.to('.element', {
  scale: 1.2,
  duration: 0.5
});
```

### `.fromTo()` — Explicit start and end

```tsx
timeline.fromTo('.element',
  { x: -100, opacity: 0 },  // From
  { x: 0, opacity: 1, duration: 1 }  // To
);
```

### `.set()` — Instant property change (no animation)

```tsx
timeline.set('.element', { visibility: 'visible' });
```

---

## Position Parameter

Control when animations start relative to each other:

```tsx
// Sequential (default) - starts after previous animation
timeline
  .from('.first', { opacity: 0, duration: 1 })
  .from('.second', { opacity: 0, duration: 1 });  // Starts at 1s

// Overlap - starts 0.5s before previous ends
timeline
  .from('.first', { opacity: 0, duration: 1 })
  .from('.second', { opacity: 0, duration: 1 }, '-=0.5');  // Starts at 0.5s

// Delay - starts 0.5s after previous ends
timeline
  .from('.first', { opacity: 0, duration: 1 })
  .from('.second', { opacity: 0, duration: 1 }, '+=0.5');  // Starts at 1.5s

// Absolute - starts at specific time
timeline
  .from('.first', { opacity: 0, duration: 1 })
  .from('.second', { opacity: 0, duration: 1 }, 2);  // Starts at 2s

// Label - starts at named point
timeline
  .addLabel('intro')
  .from('.first', { opacity: 0, duration: 1 })
  .addLabel('main')
  .from('.second', { opacity: 0, duration: 1 }, 'main');
```

---

## Common Properties

| Property | Description | Example |
|----------|-------------|---------|
| `x`, `y` | Transform translate | `{ x: 100, y: 50 }` |
| `scale` | Uniform scale | `{ scale: 1.2 }` |
| `scaleX`, `scaleY` | Axis scale | `{ scaleX: 0 }` |
| `rotation` | Degrees | `{ rotation: 360 }` |
| `opacity` | 0-1 | `{ opacity: 0 }` |
| `width`, `height` | Dimensions | `{ width: '50%' }` |
| `backgroundColor` | Color | `{ backgroundColor: '#ff0000' }` |
| `borderRadius` | Corners | `{ borderRadius: '50%' }` |

---

## Duration and Timing

```tsx
// Duration in seconds
timeline.from('.element', {
  y: 100,
  duration: 1.5  // 1.5 seconds
});

// Delay before animation starts
timeline.from('.element', {
  y: 100,
  duration: 1,
  delay: 0.5  // Wait 0.5s before starting
});
```

### Converting Frames to Seconds

```tsx
import { useVideoConfig } from 'remotion';

const { fps } = useVideoConfig();

// If you need a specific frame count as duration:
const durationInSeconds = 30 / fps;  // 30 frames

timeline.from('.element', {
  y: 100,
  duration: durationInSeconds
});
```

---

## Yoyo and Repeat

```tsx
// Bounce back and forth
timeline.to('.element', {
  scale: 1.2,
  duration: 0.3,
  yoyo: true,
  repeat: 1  // Play forward, then backward (2 total plays)
});

// Infinite repeat (careful with video duration!)
timeline.to('.element', {
  rotation: 360,
  duration: 2,
  repeat: -1,  // Infinite
  ease: 'none'  // Linear for smooth loop
});
```

---

## Important Rules

### DO: Create timeline in useEffect

```tsx
// CORRECT
useEffect(() => {
  timeline.from('.title', { y: 100, opacity: 0 });
}, []);
```

### DON'T: Create timeline in render

```tsx
// WRONG - creates new timeline every frame
return (
  <div style={{
    transform: gsap.to('.title', { y: 100 })  // BAD!
  }} />
);
```

### DO: Use scopeRef for selectors

```tsx
// CORRECT - selectors scoped to component
return <AbsoluteFill ref={scopeRef}>...</AbsoluteFill>;
```

### DON'T: Use global selectors without scope

```tsx
// RISKY - might select elements in other components
timeline.from('#global-id', { opacity: 0 });
```

---

## TypeScript Types

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import type { GSAPTimeline } from '@remotion-reloaded/gsap';

const { timeline, scopeRef } = useGSAP();
// timeline: GSAPTimeline (gsap.core.Timeline)
// scopeRef: React.RefObject<HTMLDivElement>
```

---

## See Also

- `gsap-easing.md` — Easing functions
- `gsap-stagger.md` — Stagger patterns
- `gsap-plugins.md` — MorphSVG, SplitText, DrawSVG
