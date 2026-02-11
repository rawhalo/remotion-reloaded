# Phase 1: Technical Foundation
## Detailed Specification

**Version:** 1.2
**Status:** Ready for Implementation
**Timeline:** 6-8 weeks
**Updated:** January 30, 2026

> **Note:** Timeline is 6-8 weeks to account for comprehensive error handling, serverless support, and testing infrastructure.

---

## Overview

Phase 1 establishes the technical foundation for Remotion Reloaded by integrating industry-standard animation tools, GPU-accelerated rendering, and a curated effects system. This phase focuses on expanding what's *possible* in Remotion before adding intelligence layers in later phases.

---

## 1.0 Developer Experience & AI Integration

### Objective

Enable zero-to-running in under 5 minutes, with seamless AI agent integration via the existing Remotion Skills ecosystem.

### Project Scaffolding

```bash
# New users: Create complete project
npx create-remotion-reloaded my-project
cd my-project

# Existing Remotion users: Add to project
npm install remotion-reloaded
npx remotion-reloaded init
```

#### What `create-remotion-reloaded` Sets Up

```
my-project/
├── src/
│   ├── index.ts                    # Entry point
│   ├── Root.tsx                    # Composition registry
│   └── compositions/
│       ├── HelloReloaded.tsx       # Starter example
│       ├── LogoReveal.tsx          # GSAP example
│       └── ParticleDemo.tsx        # Three.js example
├── public/
│   └── assets/
├── remotion.config.ts              # Pre-configured for GPU
├── package.json                    # All dependencies
├── tsconfig.json
├── .cursorrules                    # Cursor AI rules (optional)
└── CLAUDE.md                       # Claude Code guidance
```

#### What `remotion-reloaded init` Does

1. Patches `remotion.config.ts` with GPU settings
2. Adds example composition
3. Installs skill files
4. Creates AI assistant config files

### Configuration Helper

```ts
// remotion.config.ts (simplified)
import { withReloaded } from 'remotion-reloaded/config';

export default withReloaded({
  // User overrides (optional)
  webgpu: true,           // default: true
  gsapPlugins: 'all',     // default: 'all'
});

// Equivalent to manually configuring:
// - Config.setChromiumOpenGlRenderer('angle')
// - Config.setChromiumFlags(['--enable-unsafe-webgpu'])
// - Webpack aliases for Three.js
// - GSAP plugin registration
```

### Skills Integration

Remotion Reloaded provides its own skill package that extends the base Remotion skills:

```bash
# Install Reloaded skills (done automatically by create-remotion-reloaded)
npx skills add remotion-reloaded/skills

# Skills work alongside base Remotion skills
npx skills add remotion-dev/skills        # Base Remotion
npx skills add remotion-reloaded/skills   # Reloaded extensions
```

#### Skill Package Structure

```
remotion-reloaded/skills/
├── SKILL.md                        # Main entry point
├── rules/
│   ├── animation-selection.md      # When to use GSAP vs interpolate
│   ├── gsap-basics.md              # useGSAP hook, timeline patterns
│   ├── gsap-plugins.md             # MorphSVG, SplitText, DrawSVG
│   ├── gsap-easing.md              # Easing reference and selection
│   ├── effects-basics.md           # <Effect> component usage
│   ├── effects-catalog.md          # All 20+ effects with parameters
│   ├── effect-presets.md           # Cinematic, VHS, dream, etc.
│   ├── effect-animation.md         # Animating effect parameters
│   ├── three-basics.md             # ThreeCanvas, basic 3D
│   ├── three-particles.md          # GPUParticles system
│   ├── three-postprocessing.md     # Bloom, DOF, etc.
│   ├── webgpu-fallback.md          # Handling WebGPU unavailability
│   ├── performance.md              # Optimization guidelines
│   ├── common-patterns.md          # Logo reveals, text animations, etc.
│   └── troubleshooting.md          # Common errors and fixes
└── examples/
    ├── logo-reveal.tsx
    ├── kinetic-text.tsx
    ├── product-showcase.tsx
    ├── particle-background.tsx
    └── data-counter.tsx
```

#### SKILL.md Content

```markdown
# Remotion Reloaded Skill

Enhanced video creation with GSAP animations, GPU effects, and Three.js integration.

**Requires:** Base Remotion skill (`remotion-dev/skills`)

## When to Use This Skill

Use Remotion Reloaded patterns when you need:
- Complex sequenced animations (GSAP)
- SVG morphing or text character animations
- Visual effects (glow, glitch, VHS, film grain)
- 3D scenes or particle systems
- Professional motion design patterns

## Quick Reference

| Need | Solution | Rule File |
|------|----------|-----------|
| Complex animation sequence | `useGSAP()` hook | gsap-basics.md |
| Text character animation | GSAP SplitText | gsap-plugins.md |
| SVG shape morphing | GSAP MorphSVG | gsap-plugins.md |
| Glow/glitch/VHS effects | `<Effect>` component | effects-basics.md |
| Cinematic look | `<EffectPreset name="cinematic">` | effect-presets.md |
| 3D product showcase | `<ThreeCanvas>` | three-basics.md |
| Particle systems | `<GPUParticles>` | three-particles.md |

## Animation Selection

Read `rules/animation-selection.md` for detailed guidance on choosing:
- Remotion `interpolate()` — Simple tweens, best performance
- Remotion `spring()` — Physics-based, bouncy motion
- GSAP Timeline — Complex sequences, staggering, SVG morphing
- Three.js — 3D scenes, 100+ particles

## Rule Files

Read individual rule files for detailed explanations and code examples.
```

### AI Editor Configuration

#### For Cursor (`.cursorrules`)

```markdown
# Remotion Reloaded Project

This project uses Remotion Reloaded for enhanced video creation.

## Key Patterns

1. Use `useGSAP()` for complex animations, not raw GSAP
2. Use `<Effect type="...">` for visual effects, not CSS filters
3. Use `<ThreeCanvas>` for 3D, with `useCurrentFrame()` for animation
4. Never use CSS transitions or Tailwind animation classes
5. All animations must be driven by `useCurrentFrame()`

## Available Skills

Run `npx skills list` to see installed skills.
Refer to `skills/` for patterns in this repository.

## Quick Examples

Logo with glow:
\`\`\`tsx
<Effect type="glow" color="#6366f1" radius={20}>
  <Logo />
</Effect>
\`\`\`

GSAP timeline:
\`\`\`tsx
const { scopeRef } = useGSAP((timeline) => {
  timeline.from('.title', { y: 100, opacity: 0, ease: 'power3.out' });
});
\`\`\`
```

#### For Claude Code (`CLAUDE.md`)

```markdown
# CLAUDE.md

This project uses Remotion Reloaded for enhanced programmatic video creation.

## Installed Skills

- `remotion-dev/skills` — Base Remotion patterns
- `remotion-reloaded/skills` — GSAP, effects, Three.js patterns

## Key Rules

1. **Animation Selection**: Use GSAP for complex sequences, `interpolate()` for simple tweens
2. **Effects**: Wrap content in `<Effect>` components, don't write custom shaders
3. **3D**: Use `<ThreeCanvas>` with `useCurrentFrame()`, never `useFrame()`
4. **No CSS animations**: They don't render correctly in Remotion

## Before Writing Code

Check the skill rules for the relevant pattern:
- GSAP: `rules/gsap-basics.md`, `rules/gsap-plugins.md`
- Effects: `rules/effects-catalog.md`, `rules/effect-presets.md`
- 3D: `rules/three-basics.md`, `rules/three-particles.md`

## Common Prompts That Work Well

- "Create a logo reveal with glow effect"
- "Add kinetic text animation for [text]"
- "Create a product showcase with rotating 3D model"
- "Add particle background with flow field behavior"
- "Apply cinematic look to this composition"
```

### Validation & Diagnostics

```bash
# Check project setup
npx remotion-reloaded doctor

# Output:
# ✓ Remotion 4.x detected
# ✓ remotion-reloaded packages installed
# ✓ GPU config enabled (angle renderer)
# ✓ WebGPU flags configured
# ✓ Skills installed (remotion-reloaded/skills)
# ✓ GSAP registered
# ⚠ WebGPU not available in current browser (will use WebGL fallback)
```

### npm Package Structure

```
# Meta package (installs all)
remotion-reloaded
├── @remotion-reloaded/gsap
├── @remotion-reloaded/effects
├── @remotion-reloaded/three
└── @remotion-reloaded/config

# Or install individually
npm install @remotion-reloaded/gsap
npm install @remotion-reloaded/effects
npm install @remotion-reloaded/three
```

#### Package Dependencies

```json
// remotion-reloaded/package.json
{
  "name": "remotion-reloaded",
  "peerDependencies": {
    "remotion": "^4.0.0",
    "react": "^18.0.0"
  },
  "dependencies": {
    "@remotion-reloaded/gsap": "^1.0.0",
    "@remotion-reloaded/effects": "^1.0.0",
    "@remotion-reloaded/three": "^1.0.0",
    "@remotion-reloaded/config": "^1.0.0"
  }
}

// @remotion-reloaded/gsap/package.json
{
  "name": "@remotion-reloaded/gsap",
  "peerDependencies": {
    "remotion": "^4.0.0",
    "gsap": "^3.12.0"
  }
}

// @remotion-reloaded/three/package.json
{
  "name": "@remotion-reloaded/three",
  "peerDependencies": {
    "remotion": "^4.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0"
  }
}
```

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
import React from 'react';
import { useGSAP } from '@remotion-reloaded/gsap';
import { AbsoluteFill } from 'remotion';

export const MyComposition: React.FC = () => {
  const { scopeRef } = useGSAP((timeline) => {
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
  });

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
import React from 'react';
import { GSAPTimeline, GSAPFrom, GSAPTo } from '@remotion-reloaded/gsap';
import { AbsoluteFill } from 'remotion';

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
| **MorphSVG** | P0 | Logo morphing, shape transitions | Free |
| **DrawSVG** | P0 | Line drawing effects | Free |
| **SplitText** | P1 | Character/word-level text animation | Free |
| **MotionPath** | P1 | Animations along bezier curves | Free |
| **Physics2D** | P2 | Physics-based motion | Free |
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
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
import { useEffect } from 'react';
import gsap from 'gsap';
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
} from '@remotion-reloaded/three';

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
└── skills/
    ├── SKILL.md                # Main skill definition
    ├── rules/                  # Rule files
    └── examples/               # Example compositions
        ├── logo-reveal.tsx
        ├── kinetic-text.tsx
        ├── product-showcase.tsx
        ├── particle-background.tsx
        └── data-counter.tsx
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
| Lambda effect fallback coverage | 70%+ of effects have fallbacks |
| Test coverage (overall) | 85%+ |

### Bundle Size Targets

| Package | Max Size (min+gzip) |
|---------|---------------------|
| `@remotion-reloaded/gsap` | 8KB |
| `@remotion-reloaded/effects` | 35KB |
| `@remotion-reloaded/three` | 15KB |
| `@remotion-reloaded/config` | 3KB |

### Developer Experience

| Criteria | Target |
|----------|--------|
| Zero-to-running time | <5 minutes |
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
| Skills integrate with Cursor/Claude Code | Yes |

### Deliverables Checklist

**npm Packages:**
- [ ] `remotion-reloaded` (meta package)
- [ ] `@remotion-reloaded/gsap`
- [ ] `@remotion-reloaded/effects`
- [ ] `@remotion-reloaded/three`
- [ ] `@remotion-reloaded/config`
- [ ] `create-remotion-reloaded` (scaffolding CLI)

**CLI Tools:**
- [ ] `create-remotion-reloaded` scaffolding
- [ ] `remotion-reloaded init` for existing projects
- [ ] `remotion-reloaded doctor` diagnostics

**Skills Package:**
- [ ] skills/SKILL.md main file
- [ ] 15+ rule files covering all features
- [ ] 5+ example compositions
- [ ] Works with `npx skills add`

**AI Integration:**
- [ ] `.cursorrules` template
- [ ] `CLAUDE.md` template
- [ ] Example prompts in documentation

**Error Handling:**
- [ ] GSAP error handlers (selector, duration, plugins)
- [ ] Effect error handlers (unknown type, invalid params, WebGL)
- [ ] Three.js error handlers (WebGPU fallback, model loading)
- [ ] Error mode configuration (strict/warn/silent)

**Serverless Support:**
- [ ] Environment detection (`getRenderEnvironment()`)
- [ ] Lambda fallbacks for effects
- [ ] Lambda fallbacks for particles
- [ ] Quality presets by environment

**Testing:**
- [ ] Unit test suite (85%+ coverage)
- [ ] Integration tests with Remotion renderer
- [ ] Visual regression tests for effects
- [ ] Frame accuracy tests for GSAP
- [ ] CI pipeline (GitHub Actions)

**Build & Package:**
- [ ] Monorepo structure (pnpm + Turborepo)
- [ ] Tree-shakable exports
- [ ] ESM + CJS builds
- [ ] Bundle size within targets
- [ ] Changesets for versioning

---

## 1.5 Error Handling Strategy

### Design Principles

1. **Fail gracefully** — Never crash the render; degrade quality instead
2. **Actionable messages** — Every error includes what to do about it
3. **Dev vs Prod** — Verbose warnings in development, silent fallbacks in production
4. **Early detection** — Catch issues at build/preview time, not during final render

### GSAP Error Handling

#### Missing Selector

```tsx
// User writes:
timeline.from('.nonexistent', { opacity: 0 });

// Behavior:
// - Development: Console warning with selector and component name
// - Production: Skip animation silently
// - Never throws

// Warning format:
// [remotion-reloaded] GSAP selector '.nonexistent' matched 0 elements in <MyComposition>.
// Animation skipped. Check that elements exist when timeline is built.
```

#### Timeline Duration Mismatch

```tsx
// Composition is 90 frames (3s at 30fps)
// But GSAP timeline totals 5 seconds

// Behavior:
// - Timeline plays normally until composition ends
// - Warning in development if timeline exceeds composition
// - No warning if timeline is shorter (common and intentional)

// Warning format:
// [remotion-reloaded] GSAP timeline duration (5.0s) exceeds composition duration (3.0s).
// Timeline will be cut off at frame 90.
```

#### Plugin Not Registered

```tsx
// User tries to use MorphSVG without registering
timeline.to('#circle', { morphSVG: '#star' });

// Behavior:
// - Throws with clear instructions

// Error format:
// Error: GSAP MorphSVG plugin not registered.
//
// Add this to your component or entry file:
//   import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
//   gsap.registerPlugin(MorphSVGPlugin);
//
// Or use the auto-registration helper:
//   import '@remotion-reloaded/gsap/register-all';
```

#### Re-render Detection

```tsx
// User accidentally rebuilds timeline on every frame

// Behavior:
// - Development: Warning after detecting rebuild
// - Suggest moving to useEffect with empty deps

// Warning format:
// [remotion-reloaded] GSAP timeline rebuilt 30 times in 1 second.
// This likely means you're building the timeline in render instead of useEffect.
// Move timeline construction to: useEffect(() => { ... }, []);
```

### Effect Error Handling

#### Unknown Effect Type

```tsx
<Effect type="unknownEffect">
  <Content />
</Effect>

// Behavior:
// - Throws in development
// - Returns children unmodified in production (with warning)

// Error format:
// Error: Unknown effect type "unknownEffect".
//
// Available effects:
//   Distortion: glitch, wave, bulge, ripple, pixelate
//   Color: chromaticAberration, duotone, colorGrade, hueSaturation, sepia
//   Blur: blur, motionBlur, radialBlur, tiltShift
//   Stylization: vhs, film, halftone, neon
//   Light: glow, godRays, lensFlare, vignette
//
// Or use a preset: <EffectPreset name="cinematic">
```

#### Invalid Effect Parameters

```tsx
<Effect type="glow" radius={-10}>  // Invalid: negative radius

// Behavior:
// - Clamp to valid range with warning

// Warning format:
// [remotion-reloaded] Effect "glow" prop "radius" value -10 is invalid.
// Clamped to minimum value: 0. Valid range: 0-100.
```

#### WebGL Unavailable

```tsx
// Running in environment without WebGL

// Behavior:
// - Attempt CSS filter fallback for simple effects
// - Skip effect with warning if no fallback possible

// Warning format:
// [remotion-reloaded] WebGL unavailable. Effect "glow" falling back to CSS filter.
// Quality may be reduced. For full quality, ensure GPU rendering is enabled.

// For effects with no CSS fallback:
// [remotion-reloaded] WebGL unavailable. Effect "glitch" has no fallback and will be skipped.
// Content will render without this effect.
```

#### Effect Stack Performance

```tsx
<EffectStack>
  <Effect type="blur" radius={20} />
  <Effect type="blur" radius={10} />
  <Effect type="radialBlur" strength={0.5} />
  {/* Multiple expensive blur effects */}
</EffectStack>

// Behavior:
// - Warning when stacking multiple expensive effects

// Warning format:
// [remotion-reloaded] EffectStack contains 3 blur-type effects.
// This may cause performance issues. Consider:
// - Using a single blur with combined settings
// - Using an EffectPreset which is optimized
// - Reducing blur radius values
```

### Three.js / WebGPU Error Handling

#### WebGPU Unavailable (Fallback)

```tsx
<ThreeCanvas renderer="webgpu">
  <Scene />
</ThreeCanvas>

// Behavior:
// - Auto-fallback to WebGL
// - Log info message (not warning - this is expected in many environments)

// Info format:
// [remotion-reloaded] WebGPU not available, using WebGL renderer.
// This is normal for AWS Lambda and some browsers.
```

#### WebGPU and WebGL Both Unavailable

```tsx
// Behavior:
// - Throw with clear guidance

// Error format:
// Error: No GPU renderer available.
//
// ThreeCanvas requires WebGL or WebGPU. Ensure:
// 1. remotion.config.ts includes: Config.setChromiumOpenGlRenderer('angle')
// 2. You're not running in a headless environment without GPU support
// 3. For Lambda, use Remotion's Lambda layer with software rendering
```

#### Model Load Failure

```tsx
import { useGLTF } from '@react-three/drei';

// User loads non-existent model
const model = useGLTF('/models/missing.glb');

// Behavior:
// - Suspense boundary catches the error
// - User should provide ErrorBoundary

// Recommended pattern:
<ErrorBoundary fallback={<FallbackModel />}>
  <Suspense fallback={null}>
    <Model url="/models/product.glb" />
  </Suspense>
</ErrorBoundary>
```

#### Particle Count Exceeded

```tsx
<GPUParticles count={5000000} />  // 5 million particles

// Behavior:
// - Clamp to safe maximum with warning

// Warning format:
// [remotion-reloaded] GPUParticles count 5000000 exceeds safe maximum.
// Clamped to 100000 particles. For more particles, consider:
// - Multiple GPUParticles instances
// - Reducing particle lifetime
// - Using instanced rendering for static particles
```

### Error Helper Utilities

```tsx
import { setErrorMode, ErrorMode } from 'remotion-reloaded';

// Configure error behavior globally
setErrorMode(ErrorMode.Strict);    // Throw on all issues (CI/testing)
setErrorMode(ErrorMode.Warn);      // Warn but don't throw (development, default)
setErrorMode(ErrorMode.Silent);    // No warnings (production)

// Per-component override
<Effect type="glow" errorMode="strict">
  <Content />
</Effect>
```

---

## 1.6 Serverless & Cloud Rendering

### Environment Detection

```tsx
import { getRenderEnvironment } from 'remotion-reloaded';

const env = getRenderEnvironment();
// Returns: 'local' | 'lambda' | 'cloud-run' | 'cloud-run-gpu' | 'unknown'

// Usage in compositions:
const particleCount = env === 'lambda' ? 1000 : 10000;
```

### AWS Lambda (No GPU)

Lambda functions don't have GPU access. Remotion Reloaded handles this automatically:

#### Effects Behavior on Lambda

| Effect | Lambda Behavior |
|--------|-----------------|
| glow, vignette, sepia | CSS filter fallback |
| chromaticAberration | Simplified CSS fallback |
| blur, motionBlur | CSS filter (reduced quality) |
| glitch, wave, bulge | Skipped (no fallback) |
| vhs, film | Partial (noise only, no scan lines) |

#### Particles on Lambda

```tsx
<GPUParticles
  count={10000}
  fallbackCount={500}  // Use this count on Lambda
  fallbackBehavior="simple"  // Simpler physics on Lambda
/>

// Automatic behavior:
// - Lambda: 500 particles, CPU-based, simplified physics
// - Local/Cloud GPU: 10000 particles, GPU-based, full physics
```

#### Three.js on Lambda

```tsx
<ThreeCanvas
  renderer="webgpu"
  fallbackRenderer="software"  // Use software rendering on Lambda
  lambdaQuality="medium"       // Reduce resolution on Lambda
>
  <Scene />
</ThreeCanvas>

// Lambda-specific settings applied:
// - Software WebGL renderer
// - Reduced resolution (0.5x)
// - Simplified shadows
// - Lower anti-aliasing
```

### Google Cloud Run (With GPU)

Cloud Run GPU instances (T4, L4) support full features:

```bash
# Deploy with GPU
gcloud run deploy my-renderer \
  --gpu=1 \
  --gpu-type=nvidia-t4 \
  --image=my-remotion-image
```

#### Configuration

```tsx
// remotion.config.ts
import { Config } from '@remotion/cli/config';
import { withReloaded } from 'remotion-reloaded/config';

export default withReloaded({
  cloudRun: {
    gpuType: 'T4',  // or 'L4', 'A100'
    enableWebGPU: true,
  }
});
```

### Render Mode Detection in Compositions

```tsx
import { useRenderMode } from 'remotion-reloaded';

export const MyComposition = () => {
  const { isPreview, isRender, isLambda, hasGPU } = useRenderMode();

  return (
    <ThreeCanvas>
      {hasGPU ? (
        <GPUParticles count={50000} />
      ) : (
        <SimpleParticles count={500} />
      )}
    </ThreeCanvas>
  );
};
```

### Lambda-Specific Optimizations

```tsx
import { optimizeForLambda } from 'remotion-reloaded';

// Wrap composition for Lambda optimization
export const MyComposition = optimizeForLambda(({ lambdaMode }) => {
  return (
    <AbsoluteFill>
      {/* Effects auto-simplified on Lambda */}
      <Effect type="glow" radius={lambdaMode ? 10 : 30}>
        <Content />
      </Effect>

      {/* Skip heavy effects on Lambda */}
      {!lambdaMode && (
        <Effect type="glitch" intensity={0.5}>
          <TransitionContent />
        </Effect>
      )}
    </AbsoluteFill>
  );
});
```

### Quality Presets by Environment

```tsx
import { QualityPreset } from 'remotion-reloaded';

<EffectStack qualityPreset={QualityPreset.Auto}>
  {/* Auto selects based on environment:
      - Local preview: 'draft' (fast iteration)
      - Local render: 'high'
      - Lambda: 'lambda' (optimized for CPU)
      - Cloud Run GPU: 'high'
  */}
  <Effect type="blur" radius={20} />
  <Effect type="glow" color="#fff" />
</EffectStack>
```

---

## 1.7 Testing Strategy

### Test Categories

#### Unit Tests (Vitest)

```
tests/unit/
├── gsap/
│   ├── useGSAP.test.ts         # Hook behavior
│   ├── timeline-sync.test.ts   # Frame synchronization
│   └── plugin-registration.test.ts
├── effects/
│   ├── Effect.test.tsx         # Component rendering
│   ├── parameters.test.ts      # Parameter validation
│   └── fallbacks.test.ts       # CSS fallback logic
├── three/
│   ├── ThreeCanvas.test.tsx    # Canvas initialization
│   ├── GPUParticles.test.tsx   # Particle system
│   └── renderer-detection.test.ts
└── config/
    ├── withReloaded.test.ts    # Config helper
    └── environment.test.ts     # Environment detection
```

#### Integration Tests (Playwright + Remotion)

```
tests/integration/
├── gsap-render.test.ts         # Full render with GSAP
├── effects-render.test.ts      # Effects in actual render
├── three-render.test.ts        # 3D scene rendering
└── combined.test.ts            # All features together
```

#### Visual Regression Tests (Playwright)

```
tests/visual/
├── snapshots/
│   ├── logo-reveal/
│   │   ├── frame-0.png
│   │   ├── frame-30.png
│   │   └── frame-60.png
│   ├── effects/
│   │   ├── glow.png
│   │   ├── glitch.png
│   │   └── vhs.png
│   └── particles/
│       └── flow-field.png
└── visual.test.ts
```

### Frame Accuracy Testing

```tsx
// tests/integration/frame-accuracy.test.ts
import { renderFrames } from '@remotion/renderer';

describe('GSAP Frame Accuracy', () => {
  it('syncs within ±1 frame tolerance', async () => {
    const frames = await renderFrames({
      composition: 'GSAPTest',
      outputDir: '/tmp/frames',
    });

    // At frame 30, element should be at y=0 (animation complete)
    const frame30 = await analyzeFrame(frames[30]);
    expect(frame30.elementY).toBeCloseTo(0, 1); // ±1px tolerance
  });

  it('handles seek correctly', async () => {
    // Render frame 60 directly (not sequentially)
    const frame = await renderStill({
      composition: 'GSAPTest',
      frame: 60,
    });

    // Should match sequential render
    expect(frame).toMatchSnapshot();
  });
});
```

### Effect Quality Testing

```tsx
// tests/integration/effects.test.ts
describe('Effect Rendering', () => {
  it('glow effect renders correctly', async () => {
    const frame = await renderStill({
      composition: 'GlowTest',
      frame: 0,
    });

    // Check that glow is present (pixel analysis)
    const analysis = analyzeImage(frame);
    expect(analysis.hasGlow).toBe(true);
    expect(analysis.glowColor).toBeCloseTo('#6366f1');
  });

  it('falls back gracefully without WebGL', async () => {
    const frame = await renderStill({
      composition: 'GlowTest',
      frame: 0,
      chromiumOptions: { gl: 'swiftshader' }, // Force software
    });

    // Should still render (with CSS fallback)
    expect(frame).toBeDefined();
  });
});
```

### Performance Testing

```tsx
// tests/performance/render-time.test.ts
describe('Performance Benchmarks', () => {
  it('effect overhead under 5ms per frame', async () => {
    const withEffect = await measureRenderTime('WithGlowEffect');
    const withoutEffect = await measureRenderTime('WithoutEffect');

    const overhead = withEffect - withoutEffect;
    expect(overhead).toBeLessThan(5); // ms per frame
  });

  it('10000 particles at 60fps', async () => {
    const fps = await measureFPS('ParticleTest', { particleCount: 10000 });
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

### CI Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - run: pnpm test:integration

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - run: pnpm test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diff
          path: tests/visual/__diff__/

  browser-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install ${{ matrix.browser }}
      - run: pnpm test:integration --browser=${{ matrix.browser }}
```

### Coverage Requirements

| Category | Minimum Coverage |
|----------|------------------|
| Hooks (useGSAP, etc.) | 90% |
| Effect components | 85% |
| Config utilities | 95% |
| Three.js components | 80% |
| Overall | 85% |

### Test Utilities

```tsx
// tests/utils/render-helpers.ts
import { bundle } from '@remotion/bundler';
import { renderStill, renderMedia } from '@remotion/renderer';

export async function renderTestFrame(
  compositionId: string,
  frame: number,
  props?: Record<string, unknown>
) {
  const bundled = await bundle('./src/index.ts');
  return renderStill({
    serveUrl: bundled,
    composition: compositionId,
    frame,
    inputProps: props,
  });
}

export async function renderTestVideo(
  compositionId: string,
  props?: Record<string, unknown>
) {
  const bundled = await bundle('./src/index.ts');
  return renderMedia({
    serveUrl: bundled,
    composition: compositionId,
    codec: 'h264',
    outputLocation: `/tmp/${compositionId}.mp4`,
    inputProps: props,
  });
}
```

---

## 1.8 Package & Bundle Strategy

### Monorepo Structure

```
remotion-reloaded/
├── packages/
│   ├── remotion-reloaded/        # Meta package
│   │   ├── package.json
│   │   └── src/index.ts          # Re-exports all
│   ├── gsap/
│   │   ├── package.json
│   │   └── src/
│   ├── effects/
│   │   ├── package.json
│   │   └── src/
│   ├── three/
│   │   ├── package.json
│   │   └── src/
│   ├── config/
│   │   ├── package.json
│   │   └── src/
│   └── create-remotion-reloaded/
│       ├── package.json
│       └── src/
├── apps/
│   └── docs/                      # Documentation site
├── examples/
│   ├── basic/
│   ├── gsap-showcase/
│   ├── effects-gallery/
│   └── three-product/
├── skills/                        # Skill files (copied to packages)
├── tests/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Tooling

| Tool | Purpose |
|------|---------|
| pnpm | Package manager (workspaces) |
| Turborepo | Build orchestration |
| tsup | Bundle (esbuild-based) |
| Vitest | Unit testing |
| Playwright | Integration/visual testing |
| Changesets | Version management |

### Bundle Targets

| Package | Max Size (min+gzip) | Includes |
|---------|---------------------|----------|
| `@remotion-reloaded/gsap` | 8KB | Hooks, components (GSAP is peer dep) |
| `@remotion-reloaded/effects` | 35KB | All effects, shaders, presets |
| `@remotion-reloaded/three` | 15KB | Canvas, particles (Three.js is peer dep) |
| `@remotion-reloaded/config` | 3KB | Config helpers |
| `remotion-reloaded` | 2KB | Re-exports only |

### Tree-Shaking Support

```tsx
// Full import (not recommended)
import { useGSAP, Effect, ThreeCanvas } from 'remotion-reloaded';

// Tree-shakable imports (recommended)
import { useGSAP } from '@remotion-reloaded/gsap';
import { Effect } from '@remotion-reloaded/effects';
import { ThreeCanvas } from '@remotion-reloaded/three';

// Individual effect import (maximum tree-shaking)
import { GlowEffect } from '@remotion-reloaded/effects/glow';
import { GlitchEffect } from '@remotion-reloaded/effects/glitch';
```

### Package.json Structure

```json
// packages/effects/package.json
{
  "name": "@remotion-reloaded/effects",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./glow": {
      "import": "./dist/effects/glow.js",
      "require": "./dist/effects/glow.cjs"
    },
    "./glitch": {
      "import": "./dist/effects/glitch.js",
      "require": "./dist/effects/glitch.cjs"
    }
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "remotion": "^4.0.0"
  },
  "sideEffects": false
}
```

### Versioning Strategy

**Lockstep versioning** — All packages share the same version number.

```bash
# All packages bump together
pnpm changeset  # Create changeset
pnpm version    # Bump all packages
pnpm publish    # Publish all packages
```

Rationale:
- Simpler mental model for users
- Avoids compatibility matrix complexity
- Matches Remotion's approach

### Release Process

```bash
# 1. Create changeset for changes
pnpm changeset

# 2. Version packages (updates changelogs)
pnpm changeset version

# 3. Build all packages
pnpm build

# 4. Run full test suite
pnpm test

# 5. Publish to npm
pnpm changeset publish

# 6. Push tags
git push --follow-tags
```

### Peer Dependency Strategy

| Package | Peer Dependencies |
|---------|-------------------|
| `@remotion-reloaded/gsap` | `remotion ^4.0.0`, `gsap ^3.12.0`, `react ^18.0.0` |
| `@remotion-reloaded/effects` | `remotion ^4.0.0`, `react ^18.0.0` |
| `@remotion-reloaded/three` | `remotion ^4.0.0`, `three ^0.160.0`, `@react-three/fiber ^8.0.0`, `react ^18.0.0` |
| `@remotion-reloaded/config` | `remotion ^4.0.0` |

### Handling Version Conflicts

```tsx
// If user has gsap@3.10 but we need ^3.12
// Package manager will warn about peer dep mismatch

// We provide a compatibility check:
import { checkCompatibility } from 'remotion-reloaded';

checkCompatibility();
// Logs warnings for any version mismatches:
// [remotion-reloaded] Warning: gsap@3.10.0 detected, recommended ^3.12.0.
// Some features may not work correctly. Run: npm install gsap@latest
```

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
