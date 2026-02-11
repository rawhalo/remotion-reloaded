# Performance Benchmarks

This folder contains render-time guardrails for Phase 1b scenes.

## Commands

```bash
pnpm test:performance
```

## What Is Measured

- `render-time.test.ts`
  - Baseline render timing for `GSAPFrameAccuracy` and `CombinedShowcase`
  - Three.js scene timing for `ThreeRenderShowcase` with `chromiumOptions.gl = "angle"`
- `particle-fps.test.ts`
  - Estimated FPS from average render times at low/high particle densities
  - Lambda-style particle fallback benchmark (`environment: "lambda"`)

## Guardrails

- Benchmarks are intentionally coarse and detect large regressions, not micro-optimizations.
- Three.js and particle benchmarks auto-skip when WebGL is unavailable in the runtime.
- Thresholds are set to keep CI stable while still catching severe performance drops.
