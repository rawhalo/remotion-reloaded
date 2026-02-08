# Remotion Reloaded Skill

Enhanced video creation with GSAP animations, GPU-accelerated effects, and Three.js/WebGPU integration.

**Version:** 1.0
**Requires:** Base Remotion skill (`remotion-dev/skills`)

---

## Overview

This skill provides domain-specific knowledge for creating professional-quality videos using Remotion Reloaded's enhanced capabilities. It extends the base Remotion skill with patterns for:

- **GSAP Integration** — Timeline animations, SVG morphing, text effects
- **Shader Effects** — 20+ GPU-accelerated visual effects
- **Three.js/WebGPU** — 3D scenes, particle systems, post-processing

---

## When to Use This Skill

Use Remotion Reloaded patterns when you need:

| Need | Reloaded Solution |
|------|-------------------|
| Complex sequenced animations | GSAP Timeline via `useGSAP()` |
| Text character-by-character animation | GSAP SplitText plugin |
| SVG shape morphing | GSAP MorphSVG plugin |
| Line drawing effects | GSAP DrawSVG plugin |
| Glow, glitch, chromatic aberration | `<Effect>` components |
| Cinematic/VHS/retro looks | `<EffectPreset>` components |
| 3D product showcases | `<ThreeCanvas>` with R3F |
| Particle systems (100+) | `<GPUParticles>` |
| Depth of field, bloom | Three.js post-processing |

---

## Animation Selection Guide

**Use Remotion `interpolate()` when:**
- Simple property tweens (opacity, position, scale)
- Single-element animations
- Performance-critical renders
- Numeric value animations (counters)

**Use Remotion `spring()` when:**
- Physics-based, bouncy motion
- Natural-feeling UI animations
- Elements that need to "settle"

**Use GSAP Timeline when:**
- Complex sequenced animations
- Multiple elements with coordinated timing
- SVG path morphing (MorphSVG)
- Text character animations (SplitText)
- Line drawing effects (DrawSVG)
- Staggered animations
- Professional motion design patterns

**Use Three.js/WebGPU when:**
- 3D product showcases
- Particle systems (100+ particles)
- Custom shader effects
- Depth-based compositions
- Complex visual effects

Read `rules/animation-selection.md` for detailed decision guidance.

---

## Quick Reference

### GSAP

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';

const { timeline, scopeRef } = useGSAP();

useEffect(() => {
  timeline
    .from('.title', { y: 100, opacity: 0, duration: 1, ease: 'power3.out' })
    .from('.subtitle', { opacity: 0, stagger: 0.1 }, '-=0.5');
}, []);

return <AbsoluteFill ref={scopeRef}>...</AbsoluteFill>;
```

### Effects

```tsx
import { Effect, EffectPreset } from '@remotion-reloaded/effects';

// Single effect
<Effect type="glow" color="#6366f1" radius={20}>
  <Content />
</Effect>

// Preset (multiple effects combined)
<EffectPreset name="cinematic">
  <Content />
</EffectPreset>
```

### Three.js

```tsx
import { ThreeCanvas, GPUParticles } from '@remotion-reloaded/three';

<ThreeCanvas renderer="webgpu">
  <ambientLight />
  <MyModel />
  <GPUParticles count={5000} behavior="flow-field" />
</ThreeCanvas>
```

---

## Rule Files

Read individual rule files for detailed explanations and code examples:

### GSAP Integration
- `rules/gsap-basics.md` — useGSAP hook, timeline patterns
- `rules/gsap-plugins.md` — MorphSVG, SplitText, DrawSVG
- `rules/gsap-easing.md` — Easing functions reference
- `rules/gsap-stagger.md` — Stagger patterns for lists/grids

### Effects System
- `rules/effects-basics.md` — Effect component usage
- `rules/effects-catalog.md` — All effects with parameters
- `rules/effect-presets.md` — Pre-built aesthetic combinations
- `rules/effect-animation.md` — Animating effect parameters

### Three.js / WebGPU
- `rules/three-basics.md` — ThreeCanvas setup, basic 3D
- `rules/three-particles.md` — GPUParticles system
- `rules/three-postprocessing.md` — Bloom, DOF, vignette
- `rules/webgpu-fallback.md` — Handling WebGPU unavailability

### General
- `rules/animation-selection.md` — Choosing the right tool
- `rules/performance.md` — Optimization guidelines
- `rules/common-patterns.md` — Logo reveals, kinetic text, etc.
- `rules/troubleshooting.md` — Common errors and fixes

---

## Examples

See `examples/` directory for complete, runnable compositions:

- `logo-reveal.tsx` — GSAP animation + glow effect
- `kinetic-text.tsx` — SplitText character animation
- `product-showcase.tsx` — Three.js 3D model + particles
- `particle-background.tsx` — GPUParticles flow field
- `data-counter.tsx` — Animated number with interpolate

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| Using CSS transitions | Use GSAP or `interpolate()` |
| Using Tailwind animation classes | Use GSAP or `interpolate()` |
| Creating GSAP timeline in render | Create in `useEffect()`, seek with frame |
| Using `useFrame()` from R3F | Use `useCurrentFrame()` from Remotion |
| Forgetting to register GSAP plugins | Call `gsap.registerPlugin()` |
| Not clamping interpolations | Use `extrapolateLeft/Right: 'clamp'` |

---

## Required Configuration

Ensure `remotion.config.ts` includes:

```ts
import { withReloaded } from 'remotion-reloaded/config';
export default withReloaded();
```

Or manually configure:

```ts
Config.setChromiumOpenGlRenderer('angle');
Config.setChromiumFlags(['--enable-unsafe-webgpu']);
```
