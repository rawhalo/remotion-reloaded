# Remotion Reloaded Skill

Practical guidance for the currently implemented Remotion Reloaded API (Phase 1a).

## Current Scope

This skill covers:
- GSAP timeline sync via `useGSAP()`
- Declarative GSAP timeline components
- CSS/SVG filter effects via `<Effect>` and `<EffectStack>`
- Preset looks via `<EffectPreset>` (`cinematic`, `vintage`, `dream`)
- Config helpers (`withReloaded`, environment + time utilities)

This skill does not treat Three/WebGPU as available yet. Those APIs are planned for Phase 1b.

## Quick Start

```tsx
import { AbsoluteFill } from 'remotion';
import { useGSAP, EffectPreset } from 'remotion-reloaded';

export const Intro = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline.from('.title', { y: 80, opacity: 0, duration: 0.8 });
  });

  return (
    <EffectPreset name="cinematic">
      <AbsoluteFill ref={scopeRef}>
        <h1 className="title">Remotion Reloaded</h1>
      </AbsoluteFill>
    </EffectPreset>
  );
};
```

## Rule Files

- `rules/animation-selection.md`
- `rules/gsap-basics.md`
- `rules/effects-basics.md`
- `rules/effects-catalog.md`
- `rules/effect-presets.md`

## Configuration

```ts
import { withReloaded } from 'remotion-reloaded/config';

export default withReloaded();
```
