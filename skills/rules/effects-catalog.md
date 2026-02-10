# Effects Catalog (Phase 1a)

This catalog documents the 10 Phase 1a effects implemented in `@remotion-reloaded/effects`.
All effects also accept:
- `intensity?: number` (global strength, clamped to `0..1`)
- `children?: ReactNode`

## 1) `blur`

- Parameters: `radius?: number` (default `8`, `0..200`)
- Engine: CSS `blur()`

```tsx
<Effect type="blur" radius={14}><Content /></Effect>
```

## 2) `glow`

- Parameters:
- `color?: string` (default `#6366f1`)
- `radius?: number` (default `20`, `0..100`)
- Engine: CSS `drop-shadow()` layers

```tsx
<Effect type="glow" color="#8b5cf6" radius={18}><Content /></Effect>
```

## 3) `vignette`

- Parameters:
- `darkness?: number` (default `0.4`, `0..1`)
- `offset?: number` (default `0.5`, `0..1`)
- Engine: radial-gradient overlay

```tsx
<Effect type="vignette" darkness={0.45} offset={0.55}><Content /></Effect>
```

## 4) `sepia`

- Parameters: `amount?: number` (default `1`, `0..1`)
- Engine: CSS `sepia()`

```tsx
<Effect type="sepia" amount={0.6}><Content /></Effect>
```

## 5) `blackAndWhite`

- Parameters: `amount?: number` (default `1`, `0..1`)
- Engine: CSS `grayscale()`

```tsx
<Effect type="blackAndWhite" amount={1}><Content /></Effect>
```

## 6) `hueSaturation`

- Parameters:
- `hue?: number` (default `0`, `-180..180`)
- `saturation?: number` (default `0`, `-1..1`)
- `lightness?: number` (default `0`, `-1..1`)
- Engine: CSS `hue-rotate() saturate() brightness()`

```tsx
<Effect type="hueSaturation" hue={12} saturation={-0.2} lightness={0.05}>
  <Content />
</Effect>
```

## 7) `chromaticAberration`

- Parameters:
- `offset?: number` (default `2`, `0..20`)
- `angle?: number` (default `0`, `-360..360`)
- Engine: SVG filter RGB channel offset/blend

```tsx
<Effect type="chromaticAberration" offset={3} angle={20}><Content /></Effect>
```

## 8) `noise`

- Parameters:
- `amount?: number` (default `0.08`, `0..1`)
- `baseFrequency?: number` (default `0.8`, `0..2`)
- `octaves?: number` (default `2`, `1..8`, integer)
- `seed?: number` (default `42`, `0..9999`, integer)
- Engine: SVG `feTurbulence` + blend

```tsx
<Effect type="noise" amount={0.15} baseFrequency={0.9} octaves={3} seed={99}>
  <Content />
</Effect>
```

## 9) `duotone`

- Parameters:
- `dark?: string` (default `#1a1a2e`)
- `light?: string` (default `#e94560`)
- Engine: SVG `feColorMatrix`

```tsx
<Effect type="duotone" dark="#111827" light="#f59e0b"><Content /></Effect>
```

## 10) `film`

- Parameters:
- `grain?: number` (default `0.08`, `0..1`)
- `sepia?: number` (default `0.15`, `0..1`)
- `vignette?: number` (default `0.35`, `0..1`)
- `seed?: number` (default `21`, `0..9999`, integer)
- Engine: composite (CSS grade + vignette + SVG grain)

```tsx
<Effect type="film" grain={0.12} sepia={0.2} vignette={0.3} seed={21}>
  <Content />
</Effect>
```
