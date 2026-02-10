# Effects Basics

Remotion Reloaded effects support CSS, SVG, and WebGL backends through one API.

## Core Components

- `<Effect>`: apply one effect.
- `<EffectStack>`: compose effects in order.
- `<EffectPreset>`: apply a named stack (`cinematic`, `vintage`, `dream`, `retro-vhs`, `cyberpunk`).

## Single Effect

```tsx
import { Effect } from '@remotion-reloaded/effects';

<Effect type="glow" color="#6366f1" radius={20}>
  <MyContent />
</Effect>;
```

## Effect Stacking

```tsx
import { Effect, EffectStack } from '@remotion-reloaded/effects';

<EffectStack>
  <Effect type="contrast" amount={1.15} />
  <Effect type="chromaticAberration" offset={2.5} />
  <Effect type="vignette" darkness={0.35} />
  <MyContent />
</EffectStack>;
```

## Presets

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

<EffectPreset name="retro-vhs" intensity={0.75}>
  <MyContent />
</EffectPreset>;
```

## Animating Parameters

```tsx
import { interpolate, useCurrentFrame } from 'remotion';
import { Effect } from '@remotion-reloaded/effects';

const frame = useCurrentFrame();
const distortion = interpolate(frame, [0, 60], [0.2, 1.1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

<Effect type="vhs" distortion={distortion} jitter={0.35}>
  <MyContent />
</Effect>;
```

## Render Environment Notes

- WebGL effects run in browser/local render contexts when WebGL is available.
- On Lambda, effects with no CSS equivalent use fallback mode `skip`.
- `neon` has a CSS fallback and remains visible when WebGL is unavailable.

## Validation Behavior

- Unknown effect type throws with available options.
- Invalid params are clamped or defaulted with warnings.
- `intensity` is clamped to `0..1`.
