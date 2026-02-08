# Effects Basics

## Core Concept

Remotion Reloaded provides GPU-accelerated visual effects as simple React components. Wrap your content in an `<Effect>` component to apply shader-based effects without writing GLSL.

---

## Basic Usage

```tsx
import { Effect } from '@remotion-reloaded/effects';

// Single effect
<Effect type="glow" color="#6366f1" radius={20}>
  <MyContent />
</Effect>
```

The effect renders `<MyContent />` and applies the glow shader to it.

---

## Effect Component Props

All effects share these base props:

| Prop | Type | Description |
|------|------|-------------|
| `type` | string | Effect name (required) |
| `intensity` | number | Overall effect strength (0-1), default varies |
| `children` | ReactNode | Content to apply effect to |

Plus type-specific props documented in `effects-catalog.md`.

---

## Stacking Effects

Use `<EffectStack>` to apply multiple effects in order:

```tsx
import { EffectStack, Effect } from '@remotion-reloaded/effects';

<EffectStack>
  <Effect type="chromaticAberration" offset={2} />
  <Effect type="glow" color="#ff00ff" radius={15} />
  <Effect type="noise" amount={0.03} />
  <Effect type="vignette" darkness={0.4} />

  <MyContent />  {/* Must be last child */}
</EffectStack>
```

Effects are applied in order (top to bottom), so:
1. Chromatic aberration applied first
2. Then glow
3. Then noise
4. Then vignette
5. Result rendered

---

## Effect Presets

Pre-built combinations for common aesthetics:

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

<EffectPreset name="cinematic">
  <MyContent />
</EffectPreset>
```

### Available Presets

| Preset | Includes |
|--------|----------|
| `cinematic` | Letterbox, film grain, subtle color grade, vignette |
| `retro-vhs` | Scan lines, chromatic aberration, noise, tracking |
| `dream` | Soft glow, desaturation, gentle blur, vignette |
| `cyberpunk` | Neon glow, glitch, high contrast, chromatic aberration |
| `vintage` | Sepia, vignette, dust particles, fade |
| `noir` | High contrast B&W, heavy vignette, film grain |

### Preset Intensity

```tsx
// Reduce preset intensity (0-1)
<EffectPreset name="retro-vhs" intensity={0.5}>
  <MyContent />
</EffectPreset>
```

---

## Common Effects Quick Reference

### Glow

```tsx
<Effect
  type="glow"
  color="#6366f1"    // Glow color
  radius={20}        // Blur radius in pixels
  intensity={0.8}    // Glow strength (0-1)
>
  <Logo />
</Effect>
```

### Chromatic Aberration

```tsx
<Effect
  type="chromaticAberration"
  offset={3}         // RGB separation in pixels
  angle={0}          // Direction in degrees
>
  <Content />
</Effect>
```

### Glitch

```tsx
<Effect
  type="glitch"
  intensity={0.5}    // Glitch amount (0-1)
  blockSize={16}     // Size of glitch blocks
  speed={2}          // Animation speed multiplier
>
  <Content />
</Effect>
```

### VHS

```tsx
<Effect
  type="vhs"
  scanLines={true}
  scanLineIntensity={0.3}
  noise={0.1}
  tracking={0.02}
  rgbShift={2}
>
  <Content />
</Effect>
```

### Blur

```tsx
<Effect
  type="blur"
  radius={10}        // Blur amount in pixels
  quality="high"     // 'low', 'medium', 'high'
>
  <Content />
</Effect>
```

### Vignette

```tsx
<Effect
  type="vignette"
  darkness={0.5}     // Edge darkness (0-1)
  offset={0.5}       // How far in the effect starts
>
  <Content />
</Effect>
```

---

## Animating Effect Parameters

Use `useCurrentFrame()` and `interpolate()` to animate effect properties:

```tsx
import { useCurrentFrame, interpolate } from 'remotion';
import { Effect } from '@remotion-reloaded/effects';

export const AnimatedGlitch: React.FC = () => {
  const frame = useCurrentFrame();

  // Glitch appears frames 10-25, then fades
  const glitchIntensity = interpolate(
    frame,
    [0, 10, 25, 30],
    [0, 0, 0.8, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Effect type="glitch" intensity={glitchIntensity}>
      <TransitionContent />
    </Effect>
  );
};
```

### Transition Effect Example

```tsx
// Glitch transition between scenes
const glitchIntensity = interpolate(frame, [0, 15, 30], [0, 1, 0]);
const glitchBlockSize = interpolate(frame, [0, 15, 30], [8, 32, 8]);

<Effect
  type="glitch"
  intensity={glitchIntensity}
  blockSize={glitchBlockSize}
>
  <Sequence from={0} durationInFrames={15}>
    <SceneA />
  </Sequence>
  <Sequence from={15}>
    <SceneB />
  </Sequence>
</Effect>
```

---

## Performance Considerations

### Effect Cost (Low to High)

1. **Low cost:** vignette, sepia, hueSaturation, duotone
2. **Medium cost:** chromaticAberration, noise, pixelate
3. **High cost:** glow, glitch
4. **Very high cost:** blur, motionBlur, radialBlur

### Best Practices

```tsx
// DO: Use presets (optimized combinations)
<EffectPreset name="cinematic" />

// AVOID: Stacking multiple blur effects
<EffectStack>
  <Effect type="blur" radius={10} />
  <Effect type="motionBlur" strength={5} />  {/* Expensive! */}
  <Effect type="radialBlur" strength={0.1} />  {/* Very expensive! */}
</EffectStack>

// DO: Limit blur to one pass
<Effect type="blur" radius={10} quality="medium" />
```

---

## Troubleshooting

### Effect not rendering

1. Check GPU config in `remotion.config.ts`:
   ```ts
   Config.setChromiumOpenGlRenderer('angle');
   ```

2. Verify WebGL is available in preview

### Effect looks different in render vs preview

- Some effects use WebGPU in preview but WebGL in render
- Use `quality="high"` for consistent results

### Performance issues

- Reduce blur radius
- Use `quality="low"` or `quality="medium"`
- Avoid stacking multiple blur effects
- Consider using presets instead of manual stacks

---

## See Also

- `effects-catalog.md` — All effects with full parameter reference
- `effect-presets.md` — Preset details and customization
- `effect-animation.md` — Advanced animation patterns
