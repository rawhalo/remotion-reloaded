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
├── CLAUDE.md                          # AI assistant guidance
├── PRD.md                             # Product Requirements Document (overview)
├── SKILL.md                           # Compatibility entry (points to skills/SKILL.md)
│
├── PHASE-1-TECHNICAL-FOUNDATION.md    # GSAP, WebGPU, Effects, DX
├── PHASE-2-CINEMATOGRAPHY.md          # Camera, Motion, Transitions, Time
├── PHASE-3-INTELLIGENCE.md            # Style, Audio, Layout, Narrative, Brand DNA
├── PHASE-4-PRODUCTION.md              # Variants, Assets, Data, Analysis, Visual QA
│
├── PLAN_ASSESSMENT_AND_IDEAS.md       # External review and expansion proposals
├── FUTURE-IDEAS.md                    # Out-of-scope ideas for future consideration
│
├── skills/                            # Canonical AI Agent Skills directory
│   ├── SKILL.md                       # Main skill entry point
│   └── rules/                         # Individual rule files
│       ├── animation-selection.md
│       ├── gsap-basics.md
│       ├── effects-basics.md
│       └── ...
│
└── [future: src/]                     # Implementation code
```

---

## Phased Roadmap

### Phase 1: Technical Foundation ← *Current Priority*
**Timeline:** 6-8 weeks  
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
**Timeline:** 6-8 weeks | **Depends on:** Phase 1  
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

## Quick Start

### New Project (Recommended)

```bash
# Create a new project with everything configured
npx create-remotion-reloaded my-video-project
cd my-video-project

# Open in AI-enabled editor
cursor .   # or: claude

# Preview
npm run preview
```

### Existing Remotion Project

```bash
# Install packages
npm install remotion-reloaded

# Auto-configure (patches remotion.config.ts, adds project guidance files)
npx remotion-reloaded init

# Verify setup
npx remotion-reloaded doctor
```

### Using with AI Agents

The project includes skill files that teach AI assistants (Claude Code, Cursor, etc.) how to use Remotion Reloaded:

```bash
# Install the Remotion Reloaded skill from this repo:
npx skills add rawhalo/remotion-reloaded --skill remotion-reloaded
```

Then just describe what you want:
- *"Create a logo reveal with a purple glow effect"*
- *"Add kinetic text animation that reveals character by character"*
- *"Create a product showcase with rotating 3D model and particles"*

### Example Code

```tsx
import { useGSAP } from '@remotion-reloaded/gsap';
import { Effect } from '@remotion-reloaded/effects';
import { AbsoluteFill } from 'remotion';

export const MyVideo = () => {
  const { scopeRef } = useGSAP((timeline) => {
    timeline
      .from('.title', { y: 100, opacity: 0, ease: 'power3.out' })
      .from('.subtitle', { opacity: 0, stagger: 0.1 }, '-=0.5');
  });

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
| [skills/SKILL.md](./skills/SKILL.md) | Canonical AI agent skill definition |
| [SKILL.md](./SKILL.md) | Compatibility shim for legacy tooling |
| [Phase 1](./PHASE-1-TECHNICAL-FOUNDATION.md) | GSAP, WebGPU, effects system |
| [Phase 1 Release Checklist](./docs/PHASE-1-RELEASE-CHECKLIST.md) | First npm release and smoke test steps |
| [Phase 2](./PHASE-2-CINEMATOGRAPHY.md) | Camera, motion, transitions |
| [Phase 3](./PHASE-3-INTELLIGENCE.md) | Style, audio, layout, narrative |
| [Phase 4](./PHASE-4-PRODUCTION.md) | Variants, assets, data, analysis |

---

## Phase 1 Release

1. Add an `NPM_TOKEN` secret in your GitHub release environment.
2. Set repository variable `RELEASE_ENVIRONMENT` to that environment name (optional if your environment is named `release`).
3. Push this `1.0.0` versioned commit to `main`.
4. The `Release` workflow will publish all packages to npm.
5. For future releases, add a new `.changeset/*.md` file; the workflow will open a version PR automatically.

For a manual local release:

```bash
pnpm release:check
pnpm release:check:full   # optional, runs integration renders
pnpm release:version      # skip if versions/changelogs are already updated
pnpm install --lockfile-only
pnpm release:publish
```

---

## License

MIT

---

*Built for the future of AI-powered content creation.*
