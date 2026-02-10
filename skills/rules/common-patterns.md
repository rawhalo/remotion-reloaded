# Common Patterns

Reusable composition patterns aligned with current APIs.

## Logo Reveal

- Motion: `useGSAP()`
- Look: `Effect` or `EffectPreset`
- Example: `skills/examples/logo-reveal.tsx`

## Kinetic Text

- Motion: staggered GSAP timeline
- Look: optional contrast/glitch accent
- Example: `skills/examples/kinetic-text.tsx`

## Product Showcase

- Scene: `ThreeCanvas` + lights + rotating mesh
- Post: `EffectComposer` stack
- Example: `skills/examples/product-showcase.tsx`

## Particle Background

- Scene: `ThreeCanvas`
- Motion: `GPUParticles` with behavior config
- Example: `skills/examples/particle-background.tsx`

## Data Counter

- Number animation: `interpolate()`
- Entrance choreography: `useGSAP()`
- Look: subtle `<EffectPreset>`
- Example: `skills/examples/data-counter.tsx`
