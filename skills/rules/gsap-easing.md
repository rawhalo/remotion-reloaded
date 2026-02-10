# GSAP Easing Guide

Use easing intentionally. Keep a small set of defaults and reuse them.

## Practical Defaults

- `power3.out`: headline/hero entrances
- `power2.inOut`: controlled UI and card motion
- `expo.out`: quick, high-energy reveals
- `back.out(1.4)`: accent pops and badges
- `none`: linear utility motion

## Example

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';

useGSAP((timeline) => {
  timeline
    .from('.title', { y: 72, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.badge', { scale: 0, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.4')
    .to('.cta', { x: 28, duration: 0.5, ease: 'power2.inOut' });
});
```

## Guidance

- Avoid mixing many ease families in one short segment.
- Keep secondary elements slightly flatter than the primary subject.
- Prefer timing consistency over novelty.
