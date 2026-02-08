# Animation Selection Guide

## Decision Tree

```
Need to animate something?
│
├─ Single property, simple tween?
│   └─ Use Remotion interpolate()
│
├─ Physics-based, bouncy motion?
│   └─ Use Remotion spring()
│
├─ Complex sequence with multiple elements?
│   └─ Use GSAP Timeline
│
├─ SVG path morphing?
│   └─ Use GSAP MorphSVG
│
├─ Text character-by-character animation?
│   └─ Use GSAP SplitText
│
├─ Line drawing effect?
│   └─ Use GSAP DrawSVG
│
├─ 3D scene or product showcase?
│   └─ Use ThreeCanvas
│
├─ 100+ particles or complex physics?
│   └─ Use GPUParticles
│
└─ Visual effect (glow, glitch, etc.)?
    └─ Use <Effect> component
```

---

## Remotion `interpolate()`

**Best for:** Simple, single-property animations with maximum performance.

### When to Use

- Fading in/out (opacity)
- Moving elements (x, y position)
- Scaling elements
- Rotating elements
- Animating numeric values (counters, progress bars)
- Any simple A→B transition

### Example

```tsx
import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();

const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});

const translateY = interpolate(frame, [0, 30], [50, 0], {
  extrapolateRight: 'clamp',
});

return (
  <div style={{
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    Hello
  </div>
);
```

### Pros
- Best performance
- Native Remotion (no dependencies)
- Simple mental model
- Frame-accurate

### Cons
- Verbose for complex sequences
- No built-in staggering
- Limited easing options
- Each property needs its own interpolation

---

## Remotion `spring()`

**Best for:** Physics-based animations that feel natural and bouncy.

### When to Use

- Bouncy entrances
- UI elements that "settle"
- Natural-feeling interactions
- Pop-in effects

### Example

```tsx
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
  config: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
});

return (
  <div style={{ transform: `scale(${scale})` }}>
    Bouncy!
  </div>
);
```

### Spring Configs

| Feel | damping | stiffness | mass |
|------|---------|-----------|------|
| Bouncy | 8 | 150 | 1 |
| Snappy | 15 | 200 | 0.5 |
| Gentle | 20 | 80 | 1 |
| Heavy | 25 | 100 | 2 |

### Pros
- Natural physics feel
- Native Remotion
- Automatic settling

### Cons
- Less precise timing control
- Not great for sequences
- Limited to physics-style motion

---

## GSAP Timeline

**Best for:** Complex, choreographed animations with multiple elements.

### When to Use

- Multiple elements animating in sequence
- Overlapping animations
- Staggered list/grid animations
- Coordinated motion design
- When timing relationships matter
- Professional motion graphics

### Example

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { useEffect } from 'react';

const { timeline, scopeRef } = useGSAP();

useEffect(() => {
  timeline
    .from('.title', {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.subtitle', {
      y: 50,
      opacity: 0,
      duration: 0.8
    }, '-=0.5')  // Overlap
    .from('.items', {
      y: 30,
      opacity: 0,
      stagger: 0.1  // Each item 0.1s apart
    }, '-=0.3');
}, []);

return <AbsoluteFill ref={scopeRef}>...</AbsoluteFill>;
```

### Pros
- Powerful sequencing
- Built-in staggering
- 30+ easing presets
- Position parameter for timing
- Plugin ecosystem
- Familiar to motion designers

### Cons
- External dependency
- Slightly more setup
- Overkill for simple tweens

---

## GSAP Plugins

### MorphSVG — SVG Shape Morphing

**Use for:** Logo transformations, shape transitions, organic morphs.

```tsx
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(MorphSVGPlugin);

timeline.to('#circle', {
  morphSVG: '#star',
  duration: 1.5,
  ease: 'power2.inOut'
});
```

### SplitText — Character/Word Animation

**Use for:** Kinetic typography, text reveals, character-by-character effects.

```tsx
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const split = new SplitText('.headline', { type: 'chars' });

timeline.from(split.chars, {
  y: 50,
  opacity: 0,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.5
});
```

### DrawSVG — Line Drawing

**Use for:** Signature animations, icon drawing, path reveals.

```tsx
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(DrawSVGPlugin);

timeline.from('.path', {
  drawSVG: '0%',
  duration: 2,
  ease: 'power2.inOut'
});
```

---

## ThreeCanvas / WebGPU

**Best for:** 3D content and high-performance graphics.

### When to Use

- 3D product showcases
- 3D text
- Complex particle systems
- Custom shader effects
- Depth-based compositions

### Example

```tsx
import { ThreeCanvas } from '@remotion-reloaded/three';
import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();
const rotation = interpolate(frame, [0, 150], [0, Math.PI * 2]);

<ThreeCanvas renderer="webgpu">
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />

  <mesh rotation={[0, rotation, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#6366f1" />
  </mesh>
</ThreeCanvas>
```

**Important:** Always use `useCurrentFrame()` for animation, never `useFrame()` from R3F.

---

## GPUParticles

**Best for:** Large particle systems (100+ particles).

### When to Use

- Background particles
- Explosion effects
- Flow fields
- Confetti
- Ambient motion

### Example

```tsx
import { GPUParticles } from '@remotion-reloaded/three';

<GPUParticles
  count={5000}
  behavior="flow-field"
  config={{
    noiseScale: 0.01,
    speed: 2,
    size: [0.05, 0.2],
    color: ['#6366f1', '#ec4899'],
    lifetime: [1, 3],
  }}
/>
```

---

## Effect Components

**Best for:** Post-processing visual effects.

### When to Use

- Glow/bloom
- Glitch effects
- VHS/retro looks
- Color grading
- Blur effects
- Vignette

### Example

```tsx
import { Effect, EffectPreset } from '@remotion-reloaded/effects';

// Single effect
<Effect type="glow" color="#6366f1" radius={20}>
  <Content />
</Effect>

// Preset combination
<EffectPreset name="cinematic">
  <Content />
</EffectPreset>
```

---

## Comparison Table

| Need | Tool | Complexity | Performance |
|------|------|------------|-------------|
| Fade in | `interpolate()` | Low | Best |
| Bounce in | `spring()` | Low | Great |
| Sequence | GSAP | Medium | Great |
| Stagger list | GSAP | Medium | Great |
| Morph SVG | GSAP MorphSVG | Medium | Great |
| Text characters | GSAP SplitText | Medium | Great |
| 3D scene | ThreeCanvas | High | Good |
| 1000+ particles | GPUParticles | Medium | Great |
| Glow effect | `<Effect>` | Low | Good |
| Cinematic look | `<EffectPreset>` | Low | Good |

---

## Combining Tools

You can (and should) combine these tools:

```tsx
// GSAP for sequencing + Effects for visual treatment
<Effect type="glow" color="#6366f1">
  <div ref={scopeRef}>
    <h1 className="title">Glowing Title</h1>  {/* GSAP animates this */}
  </div>
</Effect>

// Three.js scene + interpolate for camera
const cameraZ = interpolate(frame, [0, 90], [10, 5]);

<ThreeCanvas camera={{ position: [0, 0, cameraZ] }}>
  <Scene />
</ThreeCanvas>

// GSAP timeline + Effect animation
const glitchIntensity = interpolate(frame, [45, 60], [0, 1]);

<Effect type="glitch" intensity={glitchIntensity}>
  <div ref={scopeRef}>
    {/* GSAP-animated content */}
  </div>
</Effect>
```
