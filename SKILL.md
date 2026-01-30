# Remotion Reloaded Skill
## AI Agent Skill Definition for Enhanced Video Creation

**Version:** 1.0  
**Requires:** Phase 1 Implementation  

---

## Skill Overview

This skill enables AI agents to create professional-quality programmatic videos using Remotion Reloaded's enhanced capabilities including GSAP animation, WebGPU 3D rendering, GPU-accelerated effects, and intelligent composition patterns.

---

## Core Capabilities

### What This Skill Enables

1. **Complex Timeline Animations** - GSAP-powered sequences with sophisticated easing, staggering, and morphing
2. **GPU-Accelerated 3D** - Product showcases, particle systems, and WebGPU-rendered scenes
3. **Professional Effects** - Glow, glitch, chromatic aberration, film grain, and 20+ shader effects
4. **Intelligent Composition** - Frame-accurate rendering with performance optimization

### Technology Stack

| Layer | Technology | Usage |
|-------|------------|-------|
| Core | Remotion 4.x | Frame-based video rendering |
| Animation | GSAP 3.x | Timeline animations |
| 3D | Three.js + R3F | 3D scenes and particles |
| GPU | WebGPU/WebGL | Hardware acceleration |
| Effects | Custom WGSL/GLSL | Shader-based effects |

---

## Animation Selection Guide

Choose the appropriate animation approach based on the task:

### Use Remotion `interpolate()` When:
- Simple property tweens (opacity, position, scale)
- Single-element animations
- Performance-critical renders (interpolate is fastest)
- Numeric value animations for data visualization

```tsx
const opacity = interpolate(frame, [0, 30], [0, 1]);
const scale = interpolate(frame, [0, 30], [0.8, 1], {
  extrapolateRight: 'clamp',
});
```

### Use Remotion `spring()` When:
- Physics-based, bouncy motion
- Natural-feeling UI animations
- Elements that need to "settle"

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 10, stiffness: 100 },
});
```

### Use GSAP When:
- Complex sequenced animations
- Multiple elements with coordinated timing
- SVG path morphing
- Text character animations
- Timeline scrubbing
- Professional motion design patterns

```tsx
const { timeline, scopeRef } = useGSAP();

useEffect(() => {
  timeline
    .from('.title', { y: 100, opacity: 0, duration: 1, ease: 'power3.out' })
    .from('.items', { y: 50, opacity: 0, stagger: 0.1 }, '-=0.5')
    .to('.logo', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
}, []);
```

### Use Three.js/WebGPU When:
- 3D product showcases
- Particle systems (100+ particles)
- Custom shader effects
- Depth-based compositions
- Complex visual effects

---

## GSAP Integration Patterns

### Basic Timeline

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export const GSAPComposition: React.FC = () => {
  const { timeline, scopeRef } = useGSAP();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    // Build timeline once
    timeline
      .from('.hero-title', { 
        y: 100, 
        opacity: 0, 
        duration: 1, 
        ease: 'power3.out' 
      })
      .from('.subtitle', { 
        y: 50, 
        opacity: 0, 
        duration: 0.8 
      }, '-=0.5')
      .from('.cta-button', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.3');
  }, []);

  return (
    <AbsoluteFill ref={scopeRef} className="bg-slate-900">
      <h1 className="hero-title">Welcome</h1>
      <p className="subtitle">To the future of video</p>
      <button className="cta-button">Get Started</button>
    </AbsoluteFill>
  );
};
```

### Stagger Animations

```tsx
// Staggered list items
timeline.from('.list-item', {
  y: 30,
  opacity: 0,
  duration: 0.5,
  stagger: {
    each: 0.1,
    from: 'start',  // or 'end', 'center', 'edges', 'random'
    ease: 'power2.out'
  }
});

// Grid stagger
timeline.from('.grid-item', {
  scale: 0,
  opacity: 0,
  duration: 0.4,
  stagger: {
    amount: 1,  // Total stagger time
    grid: [4, 4],
    from: 'center'
  }
});
```

### SVG Morphing

```tsx
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(MorphSVGPlugin);

// Morph between shapes
timeline.to('.shape', {
  morphSVG: '.target-shape',
  duration: 1.5,
  ease: 'power2.inOut'
});

// Morph between paths
timeline.to('#circle', {
  morphSVG: {
    shape: '#star',
    type: 'rotational',
    origin: '50% 50%'
  },
  duration: 1
});
```

### Text Animations

```tsx
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const split = new SplitText('.text', { type: 'chars,words,lines' });

// Character-by-character reveal
timeline.from(split.chars, {
  opacity: 0,
  y: 50,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.5,
  ease: 'back.out(1.7)'
});

// Word-by-word
timeline.from(split.words, {
  opacity: 0,
  scale: 0,
  stagger: 0.1,
  duration: 0.3
});
```

### Common Easing Functions

| Ease | Character | Best For |
|------|-----------|----------|
| `power1.out` | Gentle | Subtle UI |
| `power2.out` | Natural | General purpose |
| `power3.out` | Dramatic | Hero animations |
| `power4.out` | Very dramatic | Impactful reveals |
| `back.out(1.7)` | Overshoot | Bouncy buttons |
| `elastic.out(1, 0.3)` | Springy | Playful elements |
| `expo.out` | Sharp start | Fast reveals |
| `circ.out` | Round | Organic motion |
| `sine.inOut` | Smooth | Breathing, floating |

---

## Effect System Patterns

### Applying Single Effects

```tsx
import { Effect } from '@remotion-reloaded/effects';

// Glow effect
<Effect type="glow" color="#6366f1" radius={30} intensity={0.8}>
  <Logo />
</Effect>

// Chromatic aberration
<Effect type="chromaticAberration" offset={3} angle={0}>
  <Content />
</Effect>

// Glitch
<Effect type="glitch" intensity={0.5} blockSize={16} speed={2}>
  <Title />
</Effect>
```

### Effect Stacks

```tsx
import { EffectStack, Effect } from '@remotion-reloaded/effects';

<EffectStack>
  <Effect type="chromaticAberration" offset={2} />
  <Effect type="glow" color="#ff00ff" radius={15} />
  <Effect type="noise" amount={0.03} animated />
  <Effect type="vignette" darkness={0.4} />
  
  <Content />
</EffectStack>
```

### Animated Effect Parameters

```tsx
const frame = useCurrentFrame();
const glitchIntensity = interpolate(frame, [0, 15, 30], [0, 0.8, 0]);

<Effect 
  type="glitch" 
  intensity={glitchIntensity}
  blockSize={interpolate(frame, [0, 30], [8, 32])}
>
  <TransitionContent />
</Effect>
```

### Effect Presets

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

// Cinematic look
<EffectPreset name="cinematic">
  {/* Adds: letterbox, film grain, subtle color grade, vignette */}
  <Content />
</EffectPreset>

// VHS retro
<EffectPreset name="retro-vhs" intensity={0.7}>
  {/* Adds: scan lines, chromatic aberration, noise, tracking */}
  <Content />
</EffectPreset>

// Dream sequence
<EffectPreset name="dream">
  {/* Adds: soft glow, desaturation, gentle blur, vignette */}
  <Content />
</EffectPreset>
```

### Available Effects Reference

**Distortion:**
- `glitch` - Digital corruption (intensity, blockSize, speed)
- `wave` - Sine displacement (amplitude, frequency, direction)
- `bulge` - Fisheye/barrel (strength, radius, center)
- `ripple` - Water ripple (amplitude, frequency, center)
- `pixelate` - Mosaic (size, animated)

**Color:**
- `chromaticAberration` - RGB split (offset, angle)
- `duotone` - Two-color map (colorA, colorB)
- `colorGrade` - LUT/lift-gamma-gain (lut, lift, gamma, gain)
- `hueSaturation` - HSL adjust (hue, saturation, lightness)
- `sepia` - Warm vintage (intensity)

**Blur & Focus:**
- `blur` - Gaussian (radius, quality)
- `motionBlur` - Directional (strength, angle)
- `radialBlur` - Zoom blur (strength, center)
- `tiltShift` - Miniature (focus, blur, angle)

**Stylization:**
- `vhs` - Retro video (scanLines, noise, tracking, rgbShift)
- `film` - Cinematic (grain, scratches, vignette, flicker)
- `halftone` - Print dots (size, angle, shape)
- `neon` - Glow outline (color, width, intensity)

**Light:**
- `glow` - Soft bloom (color, radius, intensity)
- `godRays` - Volumetric (intensity, angle, decay)
- `lensFlare` - Anamorphic (intensity, position, color)

---

## Three.js / WebGPU Patterns

### Basic 3D Scene

```tsx
import { ThreeCanvas } from '@remotion-reloaded/three';
import { useFrame } from '@react-three/fiber';

export const ProductShowcase: React.FC = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <RotatingProduct />
      <Environment preset="studio" />
    </ThreeCanvas>
  );
};

const RotatingProduct = () => {
  const frame = useCurrentFrame();
  const meshRef = useRef();
  
  const rotation = interpolate(frame, [0, 150], [0, Math.PI * 2]);
  
  return (
    <mesh ref={meshRef} rotation={[0, rotation, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
};
```

### Particle Systems

```tsx
import { GPUParticles } from '@remotion-reloaded/three';

<GPUParticles
  count={10000}
  behavior="flow-field"
  config={{
    noiseScale: 0.01,
    speed: 2,
    curl: 0.5,
    lifetime: [1, 3],
    size: [0.05, 0.2],
    color: ['#6366f1', '#ec4899'],
    emitter: 'sphere',
    emitterRadius: 3,
    opacity: [1, 0],  // Fade out
  }}
/>

// Explosion particles
<GPUParticles
  count={5000}
  behavior="explosion"
  trigger={frame === 45}
  config={{
    velocity: 5,
    spread: 1,
    gravity: -0.1,
    lifetime: 2,
    size: [0.1, 0.3],
    color: ['#ff6b6b', '#feca57', '#ff9ff3'],
  }}
/>
```

### Post-Processing

```tsx
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@remotion-reloaded/three/effects';

<ThreeCanvas>
  <Scene />
  
  <EffectComposer>
    <Bloom 
      intensity={0.5} 
      threshold={0.8} 
      smoothing={0.9} 
    />
    <DepthOfField 
      focusDistance={0.02}
      focalLength={0.05}
      bokehScale={3}
    />
    <Vignette darkness={0.5} offset={0.5} />
  </EffectComposer>
</ThreeCanvas>
```

---

## Performance Guidelines

### Do's

1. **Memoize heavy computations**
```tsx
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
```

2. **Use CSS transforms over position changes**
```tsx
// Good
style={{ transform: `translateX(${x}px)` }}

// Avoid
style={{ left: x }}
```

3. **Limit DOM nodes for animations**
```tsx
// If >100 elements, consider Canvas/WebGL
```

4. **Cache GSAP timelines**
```tsx
useEffect(() => {
  // Build once, seek on every frame
  timeline.to('.element', {...});
}, []);  // Empty deps
```

5. **Use effect presets over manual shader stacks**
```tsx
// Good - optimized preset
<EffectPreset name="cinematic" />

// Slower - multiple separate effects
<Effect type="grain" />
<Effect type="vignette" />
<Effect type="colorGrade" />
```

### Don'ts

1. **Don't create timelines in render**
```tsx
// Bad - recreates every frame
return <div style={{ opacity: gsap.to(...) }} />
```

2. **Don't use high particle counts without WebGPU**
```tsx
// Check capability
if (!supportsWebGPU) {
  particleCount = Math.min(particleCount, 1000);
}
```

3. **Don't stack too many blur effects**
```tsx
// Blur is expensive - limit to 1-2 passes
```

4. **Don't forget to clamp interpolations**
```tsx
interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

---

## Common Composition Patterns

### Logo Reveal

```tsx
export const LogoReveal: React.FC = () => {
  const { timeline, scopeRef } = useGSAP();

  useEffect(() => {
    timeline
      .set('.logo', { scale: 0, opacity: 0 })
      .to('.logo', {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .from('.tagline', {
        y: 20,
        opacity: 0,
        duration: 0.5
      }, '-=0.2');
  }, []);

  return (
    <AbsoluteFill ref={scopeRef} className="bg-black flex-center">
      <Effect type="glow" color="#ffffff" radius={20}>
        <img className="logo" src={logo} />
      </Effect>
      <p className="tagline">Your tagline here</p>
    </AbsoluteFill>
  );
};
```

### Text Kinetic Typography

```tsx
export const KineticText: React.FC<{ text: string }> = ({ text }) => {
  const { timeline, scopeRef } = useGSAP();
  
  useEffect(() => {
    const split = new SplitText('.kinetic-text', { type: 'chars' });
    
    timeline.from(split.chars, {
      y: 100,
      rotateX: -90,
      opacity: 0,
      stagger: {
        each: 0.03,
        from: 'start'
      },
      duration: 0.6,
      ease: 'back.out(1.7)'
    });
  }, []);

  return (
    <AbsoluteFill ref={scopeRef} className="flex-center">
      <h1 className="kinetic-text text-6xl font-bold">{text}</h1>
    </AbsoluteFill>
  );
};
```

### Data Visualization Counter

```tsx
export const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const displayValue = Math.round(
    interpolate(
      frame,
      [0, durationInFrames * 0.7],
      [0, value],
      { extrapolateRight: 'clamp' }
    )
  );

  return (
    <AbsoluteFill className="flex-center">
      <Effect type="glow" color="#6366f1" radius={10}>
        <span className="text-8xl font-bold tabular-nums">
          {displayValue.toLocaleString()}
        </span>
      </Effect>
    </AbsoluteFill>
  );
};
```

### Product Showcase with Particles

```tsx
export const ProductShowcase: React.FC = () => {
  return (
    <ThreeCanvas renderer="webgpu">
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      
      <Suspense fallback={null}>
        <ProductModel url="/product.glb" />
      </Suspense>
      
      <GPUParticles
        count={2000}
        behavior="orbit"
        config={{
          radius: 3,
          speed: 0.5,
          size: 0.02,
          color: '#ffffff',
          opacity: 0.5
        }}
      />
      
      <Environment preset="city" />
      
      <EffectComposer>
        <Bloom intensity={0.3} />
        <DepthOfField focusDistance={0.02} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
```

---

## Error Prevention

### Common Mistakes and Fixes

| Mistake | Fix |
|---------|-----|
| GSAP timeline not seeking | Ensure timeline is built in useEffect, not render |
| Effects not rendering | Check WebGL/GPU enabled in render config |
| Particles invisible | Verify WebGPU support, add fallback |
| Animation timing off | Use frame/fps calculation, not real time |
| Memory leak | Clean up GSAP context on unmount |
| Black frames | Ensure all assets loaded before render |

### Required Remotion Config

```ts
// remotion.config.ts
import { Config } from '@remotion/cli/config';

// Enable GPU for effects
Config.setChromiumOpenGlRenderer('angle');

// For WebGPU
Config.setChromiumFlags(['--enable-unsafe-webgpu']);

// Webpack config for Three.js
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        three: require.resolve('three'),
      },
    },
  };
});
```

---

## Quick Reference

### Imports Cheat Sheet

```tsx
// Remotion core
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

// GSAP
import { useGSAP, GSAPTimeline } from '@remotion-reloaded/gsap';

// Effects
import { Effect, EffectStack, EffectPreset } from '@remotion-reloaded/effects';

// Three.js
import { ThreeCanvas, GPUParticles } from '@remotion-reloaded/three';
import { EffectComposer, Bloom, DepthOfField } from '@remotion-reloaded/three/effects';
```

### Timing Conversions

```tsx
const { fps, durationInFrames } = useVideoConfig();

// Seconds to frames
const frames = seconds * fps;

// Frames to seconds  
const seconds = frames / fps;

// Duration percentage
const progress = frame / durationInFrames;
```
