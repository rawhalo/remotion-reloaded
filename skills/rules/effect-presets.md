# Effect Presets

`<EffectPreset>` applies named multi-effect stacks built from the Phase 1a catalog.

```tsx
import { EffectPreset } from 'remotion-reloaded';

<EffectPreset name="cinematic">
  <Content />
</EffectPreset>
```

## Props

- `name: 'cinematic' | 'vintage' | 'dream'`
- `intensity?: number` (global scaler, clamped to `0..1`, default `1`)
- `children: ReactNode`

Global `intensity` multiplies each layer's own intensity.

## Preset Definitions

## `cinematic`

Applies:
- `hueSaturation` (subtle cool/desat grade)
- `film` (grain + mild sepia + vignette)
- `vignette` (additional edge shaping)

Use for: trailers, dramatic intros, product hero shots.

## `vintage`

Applies:
- `sepia`
- `noise` (seeded grain)
- `vignette`

Use for: archival look, retro cards, old-photo style segments.

## `dream`

Applies:
- `glow`
- `hueSaturation` (desaturation + slight lift)
- `blur`
- `vignette`

Use for: memory sequences, soft beauty shots, ambient visuals.

## Intensity Example

```tsx
<EffectPreset name="dream" intensity={0.5}>
  <Content />
</EffectPreset>
```

Lower values reduce all included layers proportionally.
