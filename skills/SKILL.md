# Remotion Reloaded Skill

Practical guidance for the currently implemented Remotion Reloaded API (Phase 1a + 1b).

This is the canonical skill entry point for this repository. Root `SKILL.md` is a compatibility shim.

## Current Scope

This skill covers:
- GSAP timeline sync via `useGSAP()` and declarative timeline components
- GSAP plugin registration and plugin-safe helpers
- CSS/SVG/WebGL effects via `<Effect>`, `<EffectStack>`, and `<EffectPreset>`
- Three.js canvas, renderer fallback, GPU particles, and post-processing wrappers
- Config helpers (`withReloaded`, `getRenderEnvironment`, `useRenderMode`, time utils)

## Decision Tree

1. Use `interpolate()` / `spring()` for simple numeric motion.
2. Use `useGSAP()` or `<GSAPTimeline>` for multi-element choreography.
3. Use `<Effect>` / `<EffectStack>` / `<EffectPreset>` for visual grading and stylization.
4. Use `@remotion-reloaded/three` for 3D scenes, particles, and post-processing.
5. For platform-sensitive rendering, use config + fallback guidance in `webgpu-fallback.md`.

## Rule Files

- `rules/animation-selection.md`
- `rules/gsap-basics.md`
- `rules/gsap-plugins.md`
- `rules/gsap-easing.md`
- `rules/effects-basics.md`
- `rules/effects-catalog.md`
- `rules/effect-presets.md`
- `rules/effect-animation.md`
- `rules/three-basics.md`
- `rules/three-particles.md`
- `rules/three-postprocessing.md`
- `rules/webgpu-fallback.md`
- `rules/performance.md`
- `rules/common-patterns.md`
- `rules/troubleshooting.md`

## Example Compositions

- `examples/logo-reveal.tsx`
- `examples/kinetic-text.tsx`
- `examples/product-showcase.tsx`
- `examples/particle-background.tsx`
- `examples/data-counter.tsx`

## Config Baseline

```ts
import { withReloaded } from 'remotion-reloaded/config';

export default withReloaded({
  webgpu: true,
});
```
