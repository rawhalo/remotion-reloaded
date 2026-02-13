<h1 align="center">Remotion Reloaded</h1>

<p align="center">
  AI-native motion tooling for <a href="https://www.remotion.dev">Remotion</a>.
</p>

<p align="center">
  <img alt="Phase" src="https://img.shields.io/badge/Phase-1%20Shipped-39FF14?style=for-the-badge&labelColor=000000" />
  <img alt="Monorepo" src="https://img.shields.io/badge/Monorepo-pnpm-008F11?style=for-the-badge&labelColor=000000" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-00FFFF?style=for-the-badge&labelColor=000000" />
</p>

<p align="center">
  <img src="./docs/assets/hero.gif" alt="Remotion Reloaded hero demo" width="960" />
</p>

## What Is Shipped

Current stable scope is **Phase 1 (Technical Foundation)**:

- Deterministic GSAP timeline integration
- Curated effects and effect presets
- Three.js support utilities for Remotion
- Existing-project CLI workflow:
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

If your base template does not have `preview`, run `npm run dev` or `npm run` to inspect available scripts.

## Skills Setup

Install Remotion Reloaded skill guidance for compatible AI tools:

```bash
npx skills add rawhalo/remotion-reloaded --skill remotion-reloaded
```

Install guide with full end-to-end setup (Remotion + skills + agent loop):

- [Installation Guide](./docs/INSTALLATION.md)

## Agentic Editing Loop

1. Start Remotion Studio.
2. Prompt your coding agent for targeted composition changes.
3. Validate visually in Studio and iterate.
4. Re-run `npx remotion-reloaded doctor` when setup drifts.

## Packages

- `remotion-reloaded`
- `@remotion-reloaded/config`
- `@remotion-reloaded/gsap`
- `@remotion-reloaded/effects`
- `@remotion-reloaded/three`
- `create-remotion-reloaded`

## Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [Phase 1 Spec](./PHASE-1-TECHNICAL-FOUNDATION.md)
- [Roadmap (High-Level)](./ROADMAP.md)
- [Product Requirements](./PRD.md)
- [Release Checklist](./docs/PHASE-1-RELEASE-CHECKLIST.md)
- [Contributing](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## Roadmap

Future phases are tracked at a high level in [ROADMAP.md](./ROADMAP.md), with detailed specs in:

- [Phase 2](./PHASE-2-CINEMATOGRAPHY.md)
- [Phase 3](./PHASE-3-INTELLIGENCE.md)
- [Phase 4](./PHASE-4-PRODUCTION.md)

## License

MIT
