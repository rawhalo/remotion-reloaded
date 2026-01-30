# Phase 1: Technical Foundation
## Detailed Specification

**Version:** 1.0  
**Status:** Ready for Implementation  
**Timeline:** 4-6 weeks  

---

## Overview

Phase 1 establishes the technical foundation for Remotion Reloaded by integrating industry-standard animation tools, GPU-accelerated rendering, and a curated effects system. This phase focuses on expanding what's *possible* in Remotion before adding intelligence layers in later phases.

---

## 1.1 GSAP Deep Integration

### Objective

First-class GreenSock Animation Platform integration that syncs seamlessly with Remotion's frame-based rendering model.

### Why GSAP?

- **Industry standard** for web animation (used by Google, Nike, Apple)
- **Extensively documented** — AI models have seen millions of examples
- **Rich plugin ecosystem** — MorphSVG, DrawSVG, SplitText, ScrollTrigger
- **Timeline-based model** maps naturally to video composition
- **Sophisticated easing presets** — 30+ built-in, customizable

### Core Challenge

Remotion renders videos frame-by-frame. GSAP typically runs in real-time with requestAnimationFrame. The integration must sync GSAP's timeline `seek()` method with Remotion's `useCurrentFrame()` hook.

### API Design

#### Hook-Based Integration

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export const MyComposition: React.FC = () => {
  const { timeline, scopeRef } = useGSAP();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    // Build timeline once on mount
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
        duration: 0.8,
        stagger: 0.1 
      }, '-=0.5')
      .to('.logo', {
        scale: 1.1,
        duration: 0.5,
        yoyo: true,
        repeat: 1
      });
  }, []);

  // Timeline automatically seeks to current frame position

  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">Hello World</h1>
      <p className="subtitle">Welcome to Remotion Reloaded</p>
      <Logo className="logo" />
    </AbsoluteFill>
  );
};
```

#### Component-Based Integration

```tsx
import { GSAPTimeline, GSAPFrom, GSAPTo } from '@remotion-reloaded/gsap';

export const MyComposition: React.FC = () => (
  <GSAPTimeline>
    <GSAPFrom 
      target=".title" 
      vars={{ y: 100, opacity: 0 }} 
      duration={1} 
      ease="power3.out"
    />
    <GSAPFrom 
      target=".subtitle" 
      vars={{ y: 50, opacity: 0, stagger: 0.1 }} 
      duration={0.8}
      position="-=0.5"
    />
    <AbsoluteFill>
      <h1 className="title">Hello World</h1>
      <p className="subtitle">Welcome</p>
    </AbsoluteFill>
  </GSAPTimeline>
);
```

### Plugin Support Matrix

| Plugin | Priority | Use Case | License |
|--------|----------|----------|---------|
| **Core GSAP** | P0 | All animations | Free |
| **MorphSVG** | P0 | Logo morphing, shape transitions | Club |
| **DrawSVG** | P0 | Line drawing effects | Club |
| **SplitText** | P1 | Character/word-level text animation | Club |
| **MotionPath** | P1 | Animations along bezier curves | Club |
| **Physics2D** | P2 | Physics-based motion | Club |
| **ScrollTrigger** | P2 | Scroll-driven animations | Free |

### Implementation Architecture

```
@remotion-reloaded/gsap/
├── src/
│   ├── hooks/
│   │   ├── useGSAP.ts           # Main hook
│   │   ├── useTimeline.ts       # Timeline management
│   │   └── useGSAPContext.ts    # Context for cleanup
│   ├── components/
│   │   ├── GSAPTimeline.tsx     # Declarative timeline
│   │   ├── GSAPFrom.tsx         # From animation
│   │   ├── GSAPTo.tsx           # To animation
│   │   └── GSAPSequence.tsx     # Sequence wrapper
│   ├── plugins/
│   │   ├── morphSVG.ts          # MorphSVG integration
│   │   ├── splitText.ts         # SplitText integration
│   │   └── drawSVG.ts           # DrawSVG integration
│   └── index.ts
├── package.json
└── README.md
```

### useGSAP Hook Implementation

```tsx
// Simplified implementation concept
export function useGSAP() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scopeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();
  const contextRef = useRef<gsap.Context>();

  // Create context and timeline on mount
  useEffect(() => {
    contextRef.current = gsap.context(() => {
      timelineRef.current = gsap.timeline({ paused: true });
    }, scopeRef);

    return () => contextRef.current?.revert();
  }, []);

  // Seek timeline to current frame position
  useEffect(() => {
    const time = frame / fps;
    timelineRef.current?.seek(time);
  }, [frame, fps]);

  return {
    timeline: timelineRef.current!,
    scopeRef,
    context: contextRef.current,
  };
}
```

### Common GSAP Patterns

#### Stagger Animations

```tsx
// List items appearing one by one
timeline.from('.list-item', {
  y: 30,
  opacity: 0,
  duration: 0.5,
  stagger: {
    each: 0.1,
    from: 'start',  // 'end', 'center', 'edges', 'random'
    ease: 'power2.out'
  }
});

// Grid stagger (2D)
timeline.from('.grid-item', {
  scale: 0,
  opacity: 0,
  duration: 0.4,
  stagger: {
    amount: 1,
    grid: [4, 4],
    from: 'center'
  }
});
```

#### SVG Path Morphing

```tsx
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(MorphSVGPlugin);

// Simple morph
timeline.to('#circle', {
  morphSVG: '#star',
  duration: 1.5,
  ease: 'power2.inOut'
});

// With options
timeline.to('#shape', {
  morphSVG: {
    shape: '#target',
    type: 'rotational',
    origin: '50% 50%'
  },
  duration: 1
});
```

#### Text Character Animation

```tsx
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

useEffect(() => {
  const split = new SplitText('.headline', { 
    type: 'chars,words,lines' 
  });

  timeline
    .from(split.chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.5,
      ease: 'back.out(1.7)'
    });

  return () => split.revert();
}, []);
```

### Easing Reference

| Ease | Character | Best For |
|------|-----------|----------|
| `power1.out` | Gentle deceleration | Subtle UI movements |
| `power2.out` | Natural feel | General purpose |
| `power3.out` | Dramatic | Hero animations |
| `power4.out` | Very dramatic | Impactful reveals |
| `back.out(1.7)` | Overshoot | Bouncy buttons, playful |
| `elastic.out(1, 0.3)` | Springy | Playful, attention-grabbing |
| `expo.out` | Sharp start, smooth end | Fast reveals |
| `circ.out` | Rounded curve | Organic motion |
| `sine.inOut` | Smooth symmetrical | Breathing, floating |
| `steps(5)` | Stepped | Frame-by-frame, retro |

---

## 1.2 WebGPU / Three.js Enhancement

### Objective

Unlock GPU-accelerated 3D rendering with modern WebGPU pipeline for particle systems, shader effects, and complex 3D scenes that would be impossible with DOM-based rendering.

### Why WebGPU over WebGL?

| Feature | WebGL | WebGPU |
|---------|-------|--------|
| Performance | Good | 2-5x faster |
| Render Bundles | No | Yes (10x for repeated geometry) |
| Compute Shaders | No | Yes (GPU particle physics) |
| Memory Management | Manual | Automatic |
| API Design | 1990s OpenGL | Modern, explicit |

### Browser Support (as of Jan 2025)

| Browser | WebGPU | WebGL |
|---------|--------|-------|
| Chrome 113+ | ✅ | ✅ |
| Edge 113+ | ✅ | ✅ |
| Firefox 141+ | ✅ | ✅ |
| Safari 26+ | ✅ | ✅ |
| Headless Chrome | ✅* | ✅ |
| AWS Lambda | ❌ | ✅ |

*Requires `--enable-unsafe-webgpu` flag

### API Design

#### Basic 3D Scene

```tsx
import { ThreeCanvas } from '@remotion-reloaded/three';
import { useCurrentFrame } from 'remotion';

export const ProductShowcase: React.FC = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"  // or "webgl" for fallback
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <RotatingProduct />
      <Environment preset="studio" />
    </ThreeCanvas>
  );
};

const RotatingProduct: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 150], [0, Math.PI * 2]);
  
  return (
    <mesh rotation={[0, rotation, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
};
```

#### GPU Particle System

```tsx
import { GPUParticles } from '@remotion-reloaded/three';

// Flow field particles
<GPUParticles
  count={50000}
  behavior="flow-field"
  config={{
    noiseScale: 0.01,
    speed: 2,
    curl: 0.5,
    lifetime: [1, 3],
    size: [0.1, 0.5],
    color: ['#6366f1', '#ec4899'],
    emitter: 'sphere',
    emitterRadius: 5
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

// Orbit particles
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
```

#### Post-Processing Effects

```tsx
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField, 
  ChromaticAberration,
  Vignette,
  Noise
} from '@remotion-reloaded/three/effects';

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
    <ChromaticAberration offset={[0.002, 0.002]} />
    <Vignette darkness={0.5} offset={0.5} />
    <Noise opacity={0.02} />
  </EffectComposer>
</ThreeCanvas>
```

### Implementation Architecture

```
@remotion-reloaded/three/
├── src/
│   ├── canvas/
│   │   ├── ThreeCanvas.tsx      # Main canvas component
│   │   ├── WebGPURenderer.ts    # WebGPU setup
│   │   └── WebGLFallback.ts     # Fallback renderer
│   ├── particles/
│   │   ├── GPUParticles.tsx     # Particle system
│   │   ├── behaviors/
│   │   │   ├── flowField.ts
│   │   │   ├── explosion.ts
│   │   │   ├── orbit.ts
│   │   │   └── attract.ts
│   │   └── shaders/
│   │       ├── particle.vert.wgsl
│   │       └── particle.frag.wgsl
│   ├── effects/
│   │   ├── EffectComposer.tsx
│   │   ├── Bloom.tsx
│   │   ├── DepthOfField.tsx
│   │   └── ...
│   └── index.ts
├── package.json
└── README.md
```

### Remotion Configuration

```ts
// remotion.config.ts
import { Config } from '@remotion/cli/config';

// Enable GPU rendering
Config.setChromiumOpenGlRenderer('angle');

// Enable WebGPU (for compatible environments)
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

## 1.3 Shader Effect System

### Objective

A curated library of GPU-accelerated visual effects accessible via simple React components, without requiring shader knowledge.

### Design Philosophy

1. **One component = one effect** — Simple mental model
2. **Sensible defaults** — Works out of the box
3. **Full control available** — Expose all parameters when needed
4. **Composable** — Stack effects in any order
5. **Performant** — GPU-accelerated, optimized shaders

### Effect Categories

#### Distortion Effects

```tsx
import { Effect } from '@remotion-reloaded/effects';

// Digital glitch
<Effect 
  type="glitch" 
  intensity={0.5}      // 0-1
  blockSize={16}       // Pixels
  speed={2}            // Multiplier
>
  <Content />
</Effect>

// Wave displacement
<Effect 
  type="wave" 
  amplitude={20}       // Pixels
  frequency={0.05}     // Waves per pixel
  speed={1}
  direction="horizontal"
>
  <Content />
</Effect>

// Fisheye/barrel distortion
<Effect 
  type="bulge" 
  strength={0.3}       // -1 to 1
  radius={0.5}         // 0-1 of viewport
  center={[0.5, 0.5]}
>
  <Content />
</Effect>

// Water ripple
<Effect 
  type="ripple" 
  amplitude={10}
  frequency={20}
  center={[0.5, 0.5]}
  speed={1}
>
  <Content />
</Effect>

// Pixelate/mosaic
<Effect 
  type="pixelate" 
  size={8}             // Pixel size
  animated={false}
>
  <Content />
</Effect>
```

#### Color Effects

```tsx
// RGB channel separation
<Effect 
  type="chromaticAberration" 
  offset={3}           // Pixels
  angle={0}            // Degrees
>
  <Content />
</Effect>

// Two-tone color mapping
<Effect 
  type="duotone" 
  dark="#1a1a2e"
  light="#e94560"
>
  <Content />
</Effect>

// Color grading
<Effect 
  type="colorGrade" 
  lift={{ r: 0, g: 0, b: 0.1 }}
  gamma={{ r: 1, g: 1, b: 1 }}
  gain={{ r: 1, g: 0.95, b: 0.9 }}
>
  <Content />
</Effect>

// HSL adjustment
<Effect 
  type="hueSaturation" 
  hue={0}              // -180 to 180
  saturation={0}       // -1 to 1
  lightness={0}        // -1 to 1
>
  <Content />
</Effect>

// Classic treatments
<Effect type="sepia" intensity={0.8} />
<Effect type="blackAndWhite" />
<Effect type="invert" />
```

#### Blur & Focus

```tsx
// Gaussian blur
<Effect 
  type="blur" 
  radius={10}          // Pixels
  quality="high"       // 'low', 'medium', 'high'
>
  <Content />
</Effect>

// Directional motion blur
<Effect 
  type="motionBlur" 
  strength={20}
  angle={45}           // Degrees
>
  <Content />
</Effect>

// Zoom blur from center
<Effect 
  type="radialBlur" 
  strength={0.1}
  center={[0.5, 0.5]}
>
  <Content />
</Effect>

// Miniature/tilt-shift
<Effect 
  type="tiltShift" 
  focus={0.5}          // Y position (0-1)
  blur={3}
  gradientSize={0.2}
>
  <Content />
</Effect>
```

#### Stylization

```tsx
// VHS retro effect
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

// Film/cinema look
<Effect 
  type="film" 
  grain={0.1}
  scratches={0.05}
  vignette={0.3}
  flicker={0.02}
>
  <Content />
</Effect>

// Print halftone
<Effect 
  type="halftone" 
  size={4}
  angle={45}
  shape="circle"       // 'circle', 'square', 'line'
>
  <Content />
</Effect>

// Neon glow outline
<Effect 
  type="neon" 
  color="#ff00ff"
  width={2}
  intensity={1}
  pulseSpeed={0}
>
  <Content />
</Effect>
```

#### Light Effects

```tsx
// Soft bloom/glow
<Effect 
  type="glow" 
  color="#6366f1"
  radius={20}
  intensity={0.8}
>
  <Content />
</Effect>

// Volumetric light rays
<Effect 
  type="godRays" 
  intensity={0.5}
  position={[0.5, 0]}  // Light source
  decay={0.95}
  samples={60}
>
  <Content />
</Effect>

// Lens flare
<Effect 
  type="lensFlare" 
  intensity={0.5}
  position={[0.7, 0.3]}
  color="#ffffff"
>
  <Content />
</Effect>

// Vignette
<Effect 
  type="vignette" 
  darkness={0.5}
  offset={0.5}
>
  <Content />
</Effect>
```

### Effect Composition

```tsx
import { EffectStack, Effect } from '@remotion-reloaded/effects';

// Stack multiple effects (applied in order)
<EffectStack>
  <Effect type="chromaticAberration" offset={2} />
  <Effect type="glow" color="#ff00ff" radius={15} />
  <Effect type="noise" amount={0.03} animated />
  <Effect type="vignette" darkness={0.4} />
  
  <Content />
</EffectStack>
```

### Effect Presets

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

// Cinematic look
<EffectPreset name="cinematic">
  {/* Applies: letterbox, film grain, subtle color grade, vignette */}
  <Content />
</EffectPreset>

// VHS retro
<EffectPreset name="retro-vhs" intensity={0.7}>
  {/* Applies: scan lines, chromatic aberration, noise, tracking errors */}
  <Content />
</EffectPreset>

// Dream sequence
<EffectPreset name="dream">
  {/* Applies: soft glow, desaturation, gentle blur, vignette */}
  <Content />
</EffectPreset>

// Cyberpunk
<EffectPreset name="cyberpunk">
  {/* Applies: neon glow, glitch, high contrast, chromatic aberration */}
  <Content />
</EffectPreset>

// Vintage photograph
<EffectPreset name="vintage">
  {/* Applies: sepia, vignette, dust particles, fade */}
  <Content />
</EffectPreset>
```

### Animated Effect Parameters

```tsx
const frame = useCurrentFrame();

// Animate glitch intensity
const glitchIntensity = interpolate(
  frame, 
  [0, 15, 30], 
  [0, 0.8, 0],
  { extrapolateRight: 'clamp' }
);

<Effect 
  type="glitch" 
  intensity={glitchIntensity}
  blockSize={interpolate(frame, [0, 30], [8, 32])}
>
  <TransitionContent />
</Effect>
```

### Implementation Architecture

```
@remotion-reloaded/effects/
├── src/
│   ├── components/
│   │   ├── Effect.tsx           # Main effect component
│   │   ├── EffectStack.tsx      # Composition container
│   │   └── EffectPreset.tsx     # Preset combinations
│   ├── effects/
│   │   ├── distortion/
│   │   │   ├── glitch.ts
│   │   │   ├── wave.ts
│   │   │   ├── bulge.ts
│   │   │   └── ...
│   │   ├── color/
│   │   │   ├── chromaticAberration.ts
│   │   │   ├── duotone.ts
│   │   │   └── ...
│   │   ├── blur/
│   │   ├── stylization/
│   │   └── light/
│   ├── shaders/
│   │   ├── glitch.frag.glsl
│   │   ├── chromatic.frag.glsl
│   │   └── ...
│   ├── presets/
│   │   ├── cinematic.ts
│   │   ├── vhs.ts
│   │   └── ...
│   └── index.ts
├── package.json
└── README.md
```

---

## 1.4 Enhanced Remotion Skill

### Objective

Update the AI agent skill to leverage all Phase 1 enhancements, providing clear guidance on when to use each tool.

### Animation Selection Decision Tree

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
├─ Text character animation?
│   └─ Use GSAP SplitText
│
├─ 3D scene or product showcase?
│   └─ Use @remotion-reloaded/three
│
├─ 100+ particles or complex physics?
│   └─ Use GPUParticles
│
└─ Visual effect (glow, glitch, etc.)?
    └─ Use @remotion-reloaded/effects
```

### Skill File Location

```
remotion-reloaded/
├── SKILL.md                    # Main skill definition
└── skill-examples/             # Example compositions
    ├── logo-reveal.tsx
    ├── text-animation.tsx
    ├── product-showcase.tsx
    ├── particle-effects.tsx
    └── data-visualization.tsx
```

---

## Success Criteria

### Technical Metrics

| Metric | Target |
|--------|--------|
| GSAP frame sync accuracy | ±1 frame |
| WebGPU particle count @ 60fps | 10,000+ |
| Effect render overhead | <5ms per effect |
| Build time increase | <20% over baseline |

### Developer Experience

| Criteria | Target |
|----------|--------|
| GSAP boilerplate | <10 lines |
| Effect application | Single component |
| TypeScript coverage | 100% |
| Documentation | All components with examples |

### AI Agent Success

| Criteria | Target |
|----------|--------|
| Correct animation tool selection | 90%+ |
| Working GSAP from natural language | Yes |
| Correct effect combinations | Yes |
| Working particle systems | Yes |

---

## Dependencies & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| remotion | ^4.0.0 | Core framework |
| gsap | ^3.12.0 | Animation |
| three | ^0.160.0 | 3D rendering |
| @react-three/fiber | ^8.15.0 | React bindings |
| @react-three/drei | ^9.90.0 | Three.js helpers |
| @react-three/postprocessing | ^2.15.0 | Post-processing |

---

## Next Steps

Upon completion of Phase 1:

1. **Phase 2: Cinematography & Motion** — Camera system, procedural motion, transitions
2. **Phase 3: Intelligence Layer** — Semantic styles, audio reactivity, design intelligence
3. **Phase 4: Production Scale** — Multi-variant generation, asset sourcing, data binding

---

*See [PHASE-2-CINEMATOGRAPHY.md](./PHASE-2-CINEMATOGRAPHY.md) for the next phase specification.*
