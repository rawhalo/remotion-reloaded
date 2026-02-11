# Remotion Reloaded
## Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Status:** Draft  

---

## Executive Summary

Remotion Reloaded is an enhancement layer and skill system built on top of Remotion that transforms programmatic video creation from a technical exercise into an intelligent, AI-native content creation platform. By combining advanced animation libraries, GPU-accelerated effects, cinematographic primitives, and semantic design systems, Remotion Reloaded enables AI agents to produce professional-quality video content that rivals traditional production workflows.

### Vision Statement

> Enable AI agents to create videos that feel *directed*, not just *coded*—with the aesthetic sophistication of a professional editor and the efficiency of automated generation.

### Core Value Propositions

1. **For AI Agents:** A richer vocabulary for expressing creative intent, reducing the gap between natural language descriptions and visual output
2. **For Developers:** Production-ready integrations with industry-standard animation tools (GSAP, Three.js, etc.) that "just work" with Remotion's frame-based model
3. **For Content Creators:** Multi-platform, multi-variant generation from single source compositions
4. **For Businesses:** Scalable, personalized video generation with consistent brand application

---

## Problem Statement

### Current Limitations

**Technical Ceiling:**
- DOM-based rendering struggles with 100+ animated elements
- No native particle systems or physics simulations
- GPU acceleration requires manual configuration
- Effect authoring (glow, glitch, chromatic aberration) is cumbersome

**Creative Ceiling:**
- Animation vocabulary limited to `interpolate()` and `spring()`
- No cinematography primitives (camera moves, depth, parallax)
- No semantic design system (mood, genre, era)
- Audio-reactivity requires manual FFT implementation

**AI Agent Ceiling:**
- Must write low-level interpolation code for every property
- No high-level abstractions for common patterns
- Cannot easily express "make it feel premium" or "energetic transitions"
- Limited ability to source/compose assets intelligently

### Target Outcomes

| Metric | Current State | Target State |
|--------|---------------|--------------|
| Elements before perf degradation | ~100 DOM nodes | 10,000+ (GPU) |
| Animation code verbosity | 20+ lines per effect | 1-3 lines |
| Effect variety | ~10 (CSS-based) | 50+ (shader-based) |
| AI prompt → render time | Manual iteration | Single-pass for standard content |
| Platform variants | Manual recreation | Auto-generated |

---

## Phased Implementation

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: Technical Foundation                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│  • GSAP Deep Integration                                                │
│  • WebGPU/Three.js Enhancement                                          │
│  • Shader Effect System                                                 │
│  • Enhanced Remotion Skill                                              │
│  Timeline: 6-8 weeks                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: Cinematography & Motion                                       │
│  ═══════════════════════════════════════════════════════════════════   │
│  • Camera System (dolly, pan, handheld, rack focus)                     │
│  • Procedural Motion Library (float, breathe, drift, flocking)          │
│  • Transition Intelligence (match cuts, J-cuts, morphs)                 │
│  • Temporal Dynamics (speed ramps, freeze frames)                       │
│  Timeline: 6-8 weeks                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: Intelligence Layer                                            │
│  ═══════════════════════════════════════════════════════════════════   │
│  • Semantic Style System (mood, genre, era)                             │
│  • Audio-Reactive Primitives                                            │
│  • Design Intelligence (auto-layout, safe zones, hierarchy)             │
│  • Emotional Arc Mapping                                                │
│  Timeline: 6-8 weeks                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: Production Scale                                              │
│  ═══════════════════════════════════════════════════════════════════   │
│  • Multi-Variant Generation                                             │
│  • Intelligent Asset System (stock, icons, generated imagery)           │
│  • Real-Time Data Binding                                               │
│  • Reference Video Analysis / Style Transfer                            │
│  Timeline: 6-8 weeks                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Technical Foundation

### 1.1 GSAP Deep Integration

**Objective:** First-class GreenSock Animation Platform integration that syncs seamlessly with Remotion's frame-based rendering model.

#### Why GSAP?

- Industry standard for web animation
- Extensively documented (AI models have seen millions of examples)
- Rich plugin ecosystem (MorphSVG, DrawSVG, SplitText, ScrollTrigger)
- Timeline-based model maps naturally to video composition
- Sophisticated easing presets

#### Core API Design

```tsx
// Hook-based integration
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
  
  return (
    <AbsoluteFill ref={scopeRef}>
      <h1 className="title">Hello World</h1>
      <p className="subtitle">Welcome to Remotion Reloaded</p>
      <Logo className="logo" />
    </AbsoluteFill>
  );
};
```

```tsx
// Component-based integration
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

#### Plugin Support Matrix

| Plugin | Priority | Use Case |
|--------|----------|----------|
| Core GSAP | P0 | All animations |
| MorphSVG | P0 | Logo morphing, shape transitions |
| DrawSVG | P0 | Line drawing effects |
| SplitText | P1 | Character/word-level text animation |
| MotionPath | P1 | Animations along bezier curves |
| ScrollTrigger | P2 | Scroll-driven animations (interactive) |
| Physics2D | P2 | Physics-based motion |

#### Implementation Notes

- Timeline `seek()` method syncs with `useCurrentFrame()`
- GSAP context for cleanup on unmount
- Support for nested timelines
- Frame-accurate rendering (no RAF conflicts)

---

### 1.2 WebGPU / Three.js Enhancement

**Objective:** Unlock GPU-accelerated 3D rendering with modern WebGPU pipeline for particle systems, shader effects, and complex scenes.

#### Why WebGPU over WebGL?

- 2-5x performance improvement for complex scenes
- Render Bundles for cached draw calls (10x faster for repeated geometry)
- Compute shaders for particle physics on GPU
- Modern API, better memory management
- Cross-platform via Dawn/wgpu

#### Core API Design

```tsx
import React from 'react';
import { Environment } from '@react-three/drei';
import { Bloom, DepthOfField, ThreeCanvas } from '@remotion-reloaded/three';

export const ProductShowcase: React.FC = () => {
  return (
    <ThreeCanvas
      renderer="webgpu"  // or "webgl" for fallback
      gl={{ antialias: true }}
    >
      {/* ProductModel and useRotation are app-specific helpers */}
      <Environment preset="studio" />
      <ProductModel 
        url="/models/iphone.glb"
        rotation={useRotation({ speed: 0.5 })}
      />
      <DepthOfField 
        focusDistance={5} 
        focalLength={0.05} 
        bokehScale={3} 
      />
      <Bloom intensity={0.5} />
    </ThreeCanvas>
  );
};
```

#### Particle System

```tsx
import { GPUParticles } from '@remotion-reloaded/three';

<GPUParticles
  count={50000}
  behavior="flow-field"
  config={{
    noiseScale: 0.01,
    speed: 2,
    curl: 0.5,
    lifetime: [1, 3],
    size: [0.1, 0.5],
    color: ['#ff6b6b', '#4ecdc4'],
    emitter: 'sphere',
    emitterRadius: 5
  }}
/>
```

#### Shader Effects (Post-Processing)

```tsx
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@remotion-reloaded/three';

<EffectComposer>
  <ChromaticAberration offset={[0.002, 0.002]} />
  <Bloom intensity={0.8} threshold={0.6} />
  <Noise opacity={0.05} />
  <Vignette darkness={0.5} offset={0.5} />
</EffectComposer>
```

#### Rendering Configuration

```ts
// remotion.config.ts
import { Config } from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle');
Config.overrideWebpackConfig((config) => {
  return enableWebGPU(config);
});
```

```json
// For Lambda/server rendering
{
  "chromiumOptions": {
    "gl": "angle",
    "enableWebGPU": true
  }
}
```

---

### 1.3 Shader Effect System

**Objective:** A curated library of GPU-accelerated visual effects accessible via simple React components, without requiring shader knowledge.

#### Effect Categories

**Distortion Effects:**
- `<Glitch>` - Digital corruption, RGB split, block displacement
- `<Wave>` - Sine/cosine displacement
- `<Bulge>` - Fisheye/barrel distortion
- `<Ripple>` - Water ripple effect
- `<Pixelate>` - Mosaic/pixel art effect

**Color Effects:**
- `<ChromaticAberration>` - RGB channel separation
- `<Duotone>` - Two-color mapping
- `<ColorGrade>` - LUT application, lift/gamma/gain
- `<HueSaturation>` - HSL adjustments
- `<Sepia>` / `<BlackAndWhite>` - Classic treatments

**Blur & Focus:**
- `<GaussianBlur>` - Standard blur
- `<MotionBlur>` - Directional blur
- `<RadialBlur>` - Zoom blur from center
- `<TiltShift>` - Miniature effect
- `<DepthBlur>` - Layer-based focus

**Stylization:**
- `<VHS>` - Scan lines, tracking errors, noise
- `<Film>` - Grain, scratches, flicker
- `<Halftone>` - Print dot pattern
- `<Sketch>` - Line drawing effect
- `<Neon>` - Glow outline effect

**Light Effects:**
- `<Glow>` - Soft bloom
- `<GodRays>` - Volumetric light
- `<LensFlare>` - Anamorphic flares
- `<Sparkle>` - Animated highlight points

#### API Design

```tsx
import { Effect, EffectStack } from '@remotion-reloaded/effects';
import { interpolate, useCurrentFrame } from 'remotion';

// Single effect
<Effect type="vhs" intensity={0.7}>
  <MyContent />
</Effect>

// Stacked effects
<EffectStack>
  <Effect type="chromaticAberration" offset={3} />
  <Effect type="glow" color="#ff00ff" radius={20} />
  <Effect type="noise" amount={0.05} animated />
</EffectStack>

// Animated effect parameters
const frame = useCurrentFrame();
<Effect 
  type="glitch" 
  intensity={interpolate(frame, [0, 30], [0, 1])}
  blockSize={interpolate(frame, [0, 30], [4, 32])}
/>
```

#### Preset Combinations

```tsx
import { EffectPreset } from '@remotion-reloaded/effects';

// Pre-built aesthetic presets
<EffectPreset name="cinematic">  // Letterbox, film grain, subtle color grade
<EffectPreset name="retro-vhs">  // VHS, scan lines, chromatic aberration
<EffectPreset name="dream">       // Soft glow, desaturation, vignette
<EffectPreset name="cyberpunk">   // Neon glow, glitch, high contrast
<EffectPreset name="vintage">     // Sepia, vignette, dust particles
```

---

### 1.4 Enhanced Remotion Skill

**Objective:** Update the AI agent skill to leverage all Phase 1 enhancements, providing better prompts and patterns.

#### Skill Structure

```
remotion-reloaded/
└── skills/
    ├── SKILL.md                    # Canonical entry point
    ├── rules/
    │   ├── animation-selection.md
    │   ├── gsap-basics.md
    │   ├── effects-basics.md
    │   ├── three-basics.md
    │   └── ...
    └── examples/
        ├── logo-reveal.tsx
        ├── kinetic-text.tsx
        ├── product-showcase.tsx
        ├── particle-background.tsx
        └── data-counter.tsx
```

#### Key Skill Directives

```markdown
## Animation Selection Guide

When creating animations, choose the appropriate tool:

| Animation Type | Recommended Approach |
|----------------|---------------------|
| Simple property tweens | Remotion `interpolate()` |
| Complex sequenced animations | GSAP Timeline |
| SVG path morphing | GSAP MorphSVG |
| Text character animation | GSAP SplitText |
| Physics-based motion | Remotion `spring()` or GSAP Physics2D |
| 3D scenes | @remotion-reloaded/three |
| Particle systems | GPUParticles (WebGPU) |
| Post-processing effects | @remotion-reloaded/effects |

## Effect Application Guidelines

1. Always wrap effects around content, not inside
2. Layer effects from subtle to pronounced
3. Animate effect intensity for reveals
4. Consider performance: blur > glow > glitch in cost
5. Use presets for consistent aesthetics
```

---

## Success Criteria: Phase 1

### Technical Metrics

- [ ] GSAP timeline syncs with Remotion frame within ±1 frame accuracy
- [ ] WebGPU renderer achieves 60fps preview for 10,000 particle scene
- [ ] All 20+ shader effects render correctly in headless mode
- [ ] Build time increase < 20% over baseline Remotion

### Developer Experience Metrics

- [ ] GSAP integration requires < 10 lines of boilerplate
- [ ] Effect application is single-component (no manual shader setup)
- [ ] TypeScript types provide full autocomplete for all APIs
- [ ] Documentation covers all components with examples

### AI Agent Metrics

- [ ] Agent can produce GSAP-based animation from natural language
- [ ] Agent correctly selects effect combinations for aesthetic prompts
- [ ] Agent generates working particle systems from descriptions
- [ ] Skill rules prevent common rendering errors

---

## Appendices

### Appendix A: Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Core | Remotion 4.x | Frame-based video rendering |
| Animation | GSAP 3.x | Timeline-based animation |
| 3D | Three.js + React Three Fiber | 3D scene composition |
| GPU | WebGPU / WebGL fallback | Hardware acceleration |
| Shaders | WGSL / GLSL | Custom effects |
| Build | Webpack 5 + esbuild | Bundling |

### Appendix B: Browser/Rendering Support Matrix

| Environment | WebGPU | WebGL | Notes |
|-------------|--------|-------|-------|
| Chrome 113+ | ✅ | ✅ | Full support |
| Headless Chrome | ✅* | ✅ | Requires --enable-unsafe-webgpu |
| Lambda | ❌ | ✅ | No GPU, CPU fallback |
| Cloud Run (GPU) | ✅ | ✅ | T4/V100 instances |

### Appendix C: Related Documents

- [Phase 2 Spec: Cinematography & Motion](./PHASE-2-CINEMATOGRAPHY.md)
- [Phase 3 Spec: Intelligence Layer](./PHASE-3-INTELLIGENCE.md)
- [Phase 4 Spec: Production Scale](./PHASE-4-PRODUCTION.md)
- [Remotion Reloaded Skill Definition](./skills/SKILL.md)

---

*Document continues in phase-specific specifications...*
