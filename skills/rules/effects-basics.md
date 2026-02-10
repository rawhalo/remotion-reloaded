# Effects Basics

Remotion Reloaded effects in Phase 1a are CSS/SVG filter based (no WebGL required).
They are deterministic and compatible with headless rendering.

## Core Components

- `<Effect>`: Apply one effect.
- `<EffectStack>`: Compose multiple effects in order.
- `<EffectPreset>`: Apply a named multi-effect look (`cinematic`, `vintage`, `dream`).

## Single Effect

```tsx
import { Effect } from 'remotion-reloaded';

<Effect type="glow" color="#6366f1" radius={20}>
  <MyContent />
</Effect>
```

## Stacking Effects

```tsx
import { Effect, EffectStack } from 'remotion-reloaded';

<EffectStack>
  <Effect type="sepia" amount={0.5} />
  <Effect type="noise" amount={0.12} seed={42} />
  <Effect type="vignette" darkness={0.35} />
  <MyContent />
</EffectStack>
```

Effects are declared top-to-bottom and applied in that order.

## Presets

```tsx
import { EffectPreset } from 'remotion-reloaded';

<EffectPreset name="cinematic" intensity={0.8}>
  <MyContent />
</EffectPreset>
```

## Animating Effect Parameters

```tsx
import { interpolate, useCurrentFrame } from 'remotion';
import { Effect } from 'remotion-reloaded';

const frame = useCurrentFrame();
const radius = interpolate(frame, [0, 40], [0, 24], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

<Effect type="blur" radius={radius}>
  <MyContent />
</Effect>
```

## Determinism (Seeded Effects)

`noise` and `film` accept `seed` so renders are stable across preview/headless:

```tsx
<Effect type="noise" amount={0.2} seed={123}>
  <MyContent />
</Effect>
```

## Error Behavior

- Unknown `type` throws and lists available effects.
- Invalid numeric parameters are clamped with warnings.
- Invalid parameter types fall back to defaults with warnings.

## See Also

- `effects-catalog.md`
- `effect-presets.md`
