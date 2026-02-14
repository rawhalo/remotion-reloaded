# Performance Guidelines

These recommendations reflect current package behavior.

## GSAP

- Build one timeline in `useGSAP()`; avoid rebuilding every frame.
- Keep selectors scoped via `scopeRef` to reduce query overhead.
- Use `dependencies` to rebuild only when timeline inputs change.

## Effects

- Prefer one preset or a short stack over many heavy effects.
- Animate only the parameters that matter for the shot.
- Keep `noise` / `film` seeds stable for deterministic results.
- Be selective with WebGL effects in Lambda-oriented pipelines.

## Three + Particles

- Start with smaller counts (for example `2_000..12_000`) and scale up per shot.
- Use `fallbackCount` and `fallbackBehavior` for predictable degraded paths.
- Watch `onEngineResolved` output to verify strategy in target environment.
- Minimize post-processing layers on high-count particle scenes.

## Config

- Keep `gl: 'angle'` for headless WebGL compatibility.
- Enable WebGPU only where deployment/runtime supports it.
- For large WebGL scenes in headless rendering, `--chrome-mode=headless-shell` and
  `--concurrency=0` are often the most stable baseline.
- For planning runs without emitting media, use dry-run routing:
  - `remotion-reloaded render --composition-id <id> --dry-run --resolve-composition-metadata`

## Measure

- Compare representative frames rather than only frame 0.
- Track render time changes when adding effects or particles.
