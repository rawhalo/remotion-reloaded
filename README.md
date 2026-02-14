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
  - `npx remotion-reloaded render --composition-id <id>`
  - `npx remotion-reloaded precomp --source-composition-id <source-id> --effects-composition-id <effects-id>`

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

## Render Safety Commands

Use classifier-driven routing for risky Three + WebGL effect stacks:

```bash
# Enforced render policy (single-pass-safe vs requires-precomp)
npx remotion-reloaded render --composition-id MyComposition

# Dry-run and resolve composition geometry into cache metadata
npx remotion-reloaded render --composition-id MyComposition --dry-run --resolve-composition-metadata

# Explicit pre-comp run (pass 1 source, pass 2 effects composition)
npx remotion-reloaded precomp --source-composition-id SourceComp --effects-composition-id EffectsComp

# Dry-run pre-comp with resolved composition geometry
npx remotion-reloaded precomp --source-composition-id SourceComp --effects-composition-id EffectsComp --dry-run --resolve-composition-metadata

# Clean stale pass-1 cache artifacts
npx remotion-reloaded precomp clean --retention-days 7
```

Operational notes:
- `render` is the enforcement point (safe combos stay single-pass, risky combos auto-route to pre-comp).
- `doctor` is advisory/preflight and uses the same classifier taxonomy as runtime.
- `--allow-unsafe-single-pass` exists for expert override flows and should be paired with timeout guardrails.

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
