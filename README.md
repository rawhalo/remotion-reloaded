# Remotion Reloaded

> Transform programmatic video creation from a technical exercise into an intelligent, AI-native content creation platform.

---

## Vision

Enable AI agents to create videos that feel *directed*, not just *coded*—with the aesthetic sophistication of a professional editor and the efficiency of automated generation.

---

## Project Structure

```
remotion-reloaded/
├── README.md                          # This file
├── PRD.md                             # Product Requirements Document (overview)
├── SKILL.md                           # AI Agent Skill Definition
│
├── PHASE-1-TECHNICAL-FOUNDATION.md    # GSAP, WebGPU, Effects
├── PHASE-2-CINEMATOGRAPHY.md          # Camera, Motion, Transitions, Time
├── PHASE-3-INTELLIGENCE.md            # Style, Audio, Layout, Narrative
├── PHASE-4-PRODUCTION.md              # Variants, Assets, Data, Analysis
│
└── [future: src/]                     # Implementation code
```

---

## Phased Roadmap

### Phase 1: Technical Foundation ← *Current Priority*
**Timeline:** 4-6 weeks  
**Document:** [PHASE-1-TECHNICAL-FOUNDATION.md](./PHASE-1-TECHNICAL-FOUNDATION.md)

| Component | Description | Status |
|-----------|-------------|--------|
| GSAP Integration | First-class timeline animation support | 📋 Specified |
| WebGPU/Three.js | GPU-accelerated 3D and particles | 📋 Specified |
| Shader Effects | 20+ curated visual effects | 📋 Specified |
| Enhanced Skill | AI agent patterns for Phase 1 | 📋 Specified |

**Key Deliverables:**
- `@remotion-reloaded/gsap` — Timeline sync, MorphSVG, SplitText
- `@remotion-reloaded/three` — WebGPU renderer, GPU particles
- `@remotion-reloaded/effects` — Glitch, glow, VHS, film grain, etc.

---

### Phase 2: Cinematography & Motion
**Timeline:** 4-6 weeks | **Depends on:** Phase 1  
**Document:** [PHASE-2-CINEMATOGRAPHY.md](./PHASE-2-CINEMATOGRAPHY.md)

| Component | Description |
|-----------|-------------|
| Camera System | Dolly, pan, tilt, shake, rack focus, parallax |
| Procedural Motion | Float, breathe, drift, flocking, noise |
| Transitions | Match cuts, J-cuts, morphs, stylized wipes |
| Temporal Dynamics | Speed ramps, freeze frames, time remapping |

**AI Prompt Unlocks:**
- "slow push in with handheld feel"
- "elements float and breathe organically"  
- "dramatic slow motion on the reveal"

---

### Phase 3: Intelligence Layer
**Timeline:** 6-8 weeks | **Depends on:** Phase 1, 2  
**Document:** [PHASE-3-INTELLIGENCE.md](./PHASE-3-INTELLIGENCE.md)

| Component | Description |
|-----------|-------------|
| Semantic Style | Mood, genre, era → visual parameters |
| Audio-Reactive | Beat detection, frequency analysis, music sync |
| Design Intelligence | Safe zones, typography hierarchy, auto-layout |
| Narrative Arcs | Emotional pacing, energy curves |

**AI Prompt Unlocks:**
- "make it feel premium and sophisticated"
- "sync the visuals to the beat"
- "format for TikTok with safe zones"

---

### Phase 4: Production Scale
**Timeline:** 6-8 weeks | **Depends on:** Phase 1, 2, 3  
**Document:** [PHASE-4-PRODUCTION.md](./PHASE-4-PRODUCTION.md)

| Component | Description |
|-----------|-------------|
| Multi-Variant | One source → 50+ platform/duration variants |
| Asset Intelligence | Auto-sourced stock, generated images, voice |
| Data Binding | Personalized videos at scale |
| Style Transfer | Analyze reference video, apply to new content |

**AI Prompt Unlocks:**
- "create this ad for all social platforms in 15 and 30 second versions"
- "use stock footage of nature, add professional voiceover"
- "make it match the style of this reference video"

---

## Why This Matters

### Current State of AI Video

Most AI video tools are either:
1. **Template-based** — Fill in blanks, limited creativity
2. **Prompt-to-video** — Little control, inconsistent quality
3. **Code-based** — Powerful but requires expertise

### Remotion Reloaded's Position

A **middle path** that combines:
- The control of programmatic video (Remotion)
- The accessibility of natural language (AI agents)
- The sophistication of professional tooling (GSAP, shaders)

### For AI Agents Specifically

| Without Reloaded | With Reloaded |
|------------------|---------------|
| Write 20+ lines of interpolation | Write 3 lines of GSAP |
| Manual shader setup | `<Effect type="glow">` |
| Hope the timing looks right | `ease="power3.out"` (named presets) |
| Struggle to express "cinematic" | `<EffectPreset name="cinematic">` |
| Rebuild for each platform | `<VariantMatrix platforms={[...]}>` |

---

## Quick Start (Future)

```bash
# Install Remotion Reloaded packages
npm install @remotion-reloaded/gsap @remotion-reloaded/three @remotion-reloaded/effects

# Or all-in-one
npm install remotion-reloaded
```

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { Effect } from '@remotion-reloaded/effects';

export const MyVideo = () => {
  const { timeline, scopeRef } = useGSAP();
  
  useEffect(() => {
    timeline
      .from('.title', { y: 100, opacity: 0, ease: 'power3.out' })
      .from('.subtitle', { opacity: 0, stagger: 0.1 }, '-=0.5');
  }, []);

  return (
    <AbsoluteFill ref={scopeRef}>
      <Effect type="glow" color="#6366f1">
        <h1 className="title">Hello World</h1>
      </Effect>
      <p className="subtitle">Welcome to Remotion Reloaded</p>
    </AbsoluteFill>
  );
};
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](./PRD.md) | Product requirements overview |
| [SKILL.md](./SKILL.md) | AI agent skill definition |
| [Phase 1](./PHASE-1-TECHNICAL-FOUNDATION.md) | GSAP, WebGPU, effects system |
| [Phase 2](./PHASE-2-CINEMATOGRAPHY.md) | Camera, motion, transitions |
| [Phase 3](./PHASE-3-INTELLIGENCE.md) | Style, audio, layout, narrative |
| [Phase 4](./PHASE-4-PRODUCTION.md) | Variants, assets, data, analysis |

---

## License

TBD

---

*Built for the future of AI-powered content creation.*
