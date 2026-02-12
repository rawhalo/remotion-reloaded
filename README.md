# Remotion Reloaded

Remotion Reloaded is an enhancement layer for Remotion that gives you production-friendly building blocks for animation, effects, and Three.js workflows.

Current stable scope in this repo is **Phase 1 (Technical Foundation)**.

## What You Get Today

- GSAP integration helpers for deterministic timeline-based animation
- Curated effect components and presets
- Three.js integration utilities for Remotion
- CLI workflow for existing projects:
  - `npx remotion-reloaded init`
  - `npx remotion-reloaded doctor`

## Quick Start

### New Project

```bash
npx create-remotion-reloaded my-video-project
cd my-video-project
npm run preview
```

### Existing Remotion Project

```bash
npm install remotion-reloaded
npx remotion-reloaded init
npm install
npx remotion-reloaded doctor
```

Notes:
- `init` patches `remotion.config.*` for Reloaded defaults and adds starter guidance files.
- Base Remotion templates may use `npm run dev` instead of `npm run preview`.

## AI Skill Installation

To add the Remotion Reloaded skill package for compatible AI tools:

```bash
npx skills add rawhalo/remotion-reloaded --skill remotion-reloaded
```

Skill docs:
- `skills/SKILL.md`
- `SKILL.md` (compatibility shim)

## Package Overview

- `remotion-reloaded` (meta package + CLI)
- `@remotion-reloaded/config`
- `@remotion-reloaded/gsap`
- `@remotion-reloaded/effects`
- `@remotion-reloaded/three`
- `create-remotion-reloaded`

## Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [Product Requirements](./PRD.md)
- [Phase 1 Spec](./PHASE-1-TECHNICAL-FOUNDATION.md)
- [Release Checklist](./docs/PHASE-1-RELEASE-CHECKLIST.md)
- [Roadmap (High-Level)](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## Roadmap

Future phases are tracked at a high level in [ROADMAP.md](./ROADMAP.md).
Detailed phase specs are retained in:

- [Phase 2](./PHASE-2-CINEMATOGRAPHY.md)
- [Phase 3](./PHASE-3-INTELLIGENCE.md)
- [Phase 4](./PHASE-4-PRODUCTION.md)

## License

MIT
