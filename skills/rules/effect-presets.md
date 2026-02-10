# Effect Presets

`<EffectPreset>` applies named multi-effect stacks.

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

<EffectPreset name="cinematic" intensity={0.85}>
  <Content />
</EffectPreset>;
```

## Props

- `name: 'cinematic' | 'vintage' | 'dream' | 'retro-vhs' | 'cyberpunk'`
- `intensity?: number` (global multiplier, clamped `0..1`, default `1`)
- `children: ReactNode`

## Presets

## `cinematic`
- `hueSaturation`
- `film`
- `vignette`

## `vintage`
- `sepia`
- `noise`
- `vignette`

## `dream`
- `glow`
- `hueSaturation`
- `blur`
- `vignette`

## `retro-vhs`
- `vhs`
- `chromaticAberration`
- `noise`
- `glitch`

## `cyberpunk`
- `neon`
- `glitch`
- `contrast`
- `hueSaturation`

## Intensity Example

```tsx
<EffectPreset name="cyberpunk" intensity={0.55}>
  <Content />
</EffectPreset>
```
