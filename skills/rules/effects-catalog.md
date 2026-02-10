# Effects Catalog

This catalog reflects the effects currently registered in `@remotion-reloaded/effects`.

## Shared Props

All effects accept:
- `children?: ReactNode`
- `className?: string`
- `style?: CSSProperties`
- `intensity?: number` (`0..1`, default `1`)

## CSS Effects

- `blur`: `radius`
- `glow`: `color`, `radius`
- `vignette`: `darkness`, `offset`
- `sepia`: `amount`
- `blackAndWhite`: `amount`
- `hueSaturation`: `hue`, `saturation`, `lightness`
- `contrast`: `amount`
- `invert`: `amount`

## SVG Effects

- `chromaticAberration`: `offset`, `angle`
- `noise`: `amount`, `baseFrequency`, `octaves`, `seed`
- `duotone`: `dark`, `light`
- `displacement`: `scale`, `baseFrequency`, `seed`

## Composite Effects

- `film`: `grain`, `sepia`, `vignette`, `seed`

## WebGL Effects

- `glitch`: `strength`, `blockSize`, `seed`
- `wave`: `amplitude`, `frequency`, `speed`
- `bulge`: `radius`, `strength`, `centerX`, `centerY`
- `ripple`: `amplitude`, `frequency`, `speed`, `centerX`, `centerY`
- `pixelate`: `size`
- `motionBlur`: `distance`, `angle`, `samples`
- `radialBlur`: `strength`, `samples`, `centerX`, `centerY`
- `tiltShift`: `blur`, `focus`, `falloff`
- `vhs`: `scanlines`, `distortion`, `jitter`, `noise`
- `halftone`: `scale`, `angle`, `threshold`
- `neon`: `color`, `radius`, `threshold`
- `godRays`: `exposure`, `decay`, `density`, `weight`, `lightPositionX`, `lightPositionY`
- `lensFlare`: `intensity`, `haloSize`, `streaks`, `lightPositionX`, `lightPositionY`

## Usage Example

```tsx
import { Effect } from '@remotion-reloaded/effects';

<Effect type="lensFlare" intensity={0.7} haloSize={0.28} streaks={8}>
  <Content />
</Effect>
```

## Inspect Available Types at Runtime

```tsx
import { getAvailableEffectTypes } from '@remotion-reloaded/effects';

const names = getAvailableEffectTypes();
```
