# Spike 0.3: WebGL/WebGPU in CI Environments — Findings

**Date:** 2026-02-08
**Environment:** macOS (Darwin 25.2.0, Apple M1 Pro), Node 25.5.0, Remotion 4.0.420
**Chrome:** Headless Shell 144.0.7559.20 (arm64)

---

## Test Results Summary

| Renderer Mode | WebGL 1 | WebGL 2 | WebGPU | Details |
|--------------|---------|---------|--------|---------|
| default | NO | NO | YES | Headless Chrome doesn't enable WebGL by default |
| **angle** | **YES** | **YES** | **YES** | **Full GPU support via ANGLE (Metal backend on Mac)** |
| swiftshader | NO | NO | NO | Chrome Headless Shell 144 doesn't bundle SwiftShader |
| webgpu flags | NO | NO | YES | `--enable-unsafe-webgpu` alone doesn't enable WebGL |

## Key Findings

### 1. WebGL requires ANGLE renderer mode

Remotion's headless Chrome does **not** enable WebGL by default. You must set:

```ts
// In remotion.config.ts
Config.setChromiumOpenGlRenderer('angle');

// Or in renderStill/renderMedia options
chromiumOptions: { gl: "angle" }
```

With ANGLE enabled, **WebGL 1, WebGL 2, and WebGPU are all available** on machines with a GPU. The ANGLE backend uses Metal on macOS and Vulkan/D3D on other platforms.

### 2. SwiftShader is NOT bundled in Chrome Headless Shell

Chrome Headless Shell (the binary Remotion downloads) does **not** include SwiftShader. The `--use-gl=swiftshader` flag has no effect — all three APIs return unavailable.

This means our CI strategy needs adjustment:
- **CI with ANGLE on GPU runners:** WebGL works via ANGLE
- **CI without GPU (GitHub Actions standard):** WebGL may not work
- **SwiftShader is not a fallback option** for Chrome Headless Shell

### 3. WebGPU is available by default (on GPU machines)

WebGPU (`navigator.gpu`) is available in Chrome 144 even without special flags. The `--enable-unsafe-webgpu` flag is no longer needed in recent Chrome versions. However, WebGPU only works on machines with actual GPU hardware — it won't work on standard CI runners.

### 4. ANGLE probe details (local macOS)

When ANGLE is enabled on Apple M1 Pro:
- **GL Version:** WebGL 1.0 (OpenGL ES 2.0 Chromium)
- **GLSL Version:** WebGL GLSL ES 1.0
- **Renderer:** ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified Version)
- **Vendor:** Google Inc. (Apple)
- **Max Texture Size:** 16384
- **Max Renderbuffer Size:** 16384

## Revised CI Strategy

### For Phase 1a (CSS/SVG effects only — no GPU needed)

CSS filters and SVG filters work in **all** rendering modes because they're handled by Chromium's compositing layer, not by WebGL. This means:
- All Phase 1a effects work on any CI runner
- No GPU configuration needed for Phase 1a tests
- Lambda compatibility is confirmed (CSS/SVG rendering is CPU-based)

### For Phase 1b (Three.js / WebGL effects)

| Environment | Strategy |
|-------------|----------|
| **Local dev** | Use `gl: "angle"` — full WebGL + WebGPU via hardware GPU |
| **CI (standard runner)** | Skip WebGL render tests; run only unit/logic tests for Three.js code |
| **CI (GPU runner)** | Use `gl: "angle"` — full WebGL rendering tests |
| **Lambda** | WebGL typically unavailable; use CSS fallbacks + reduced particles |
| **Cloud Run GPU** | Use `gl: "angle"` — full rendering with T4/L4 GPU |

### Recommended Remotion Config

```ts
import { Config } from '@remotion/cli/config';

// Always set ANGLE for WebGL support
Config.setChromiumOpenGlRenderer('angle');

// Our withReloaded() helper should do this automatically:
export function withReloaded(options = {}) {
  Config.setChromiumOpenGlRenderer('angle');
  // ... other config
}
```

### GitHub Actions Workflow

```yaml
# Standard runner: unit tests + CSS/SVG render tests (no GPU)
test-unit:
  runs-on: ubuntu-latest
  steps:
    - run: pnpm test:unit
    - run: pnpm test:effects-css  # CSS/SVG effects render fine

# GPU runner (optional, nightly): WebGL render tests
test-webgl:
  runs-on: [self-hosted, gpu]  # Or a GPU-enabled runner service
  steps:
    - run: pnpm test:three
    - run: pnpm test:effects-webgl
```

## Impact on Plan

1. **Task 1.2 (config):** `withReloaded()` must set `gl: "angle"` by default
2. **Task 2.1 (Three.js):** Must require ANGLE renderer and detect when WebGL is unavailable
3. **CI workflow:** Split into GPU and non-GPU test suites
4. **SwiftShader strategy is dead:** Cannot rely on SwiftShader for CI WebGL fallback. Must use actual GPU runner or skip WebGL tests.

## Output Images

All probe screenshots in `spike/out/webgl-test/`:
- `webgl-probe.png` — Default mode
- `probe-angle.png` — ANGLE mode (full WebGL + WebGPU)
- `probe-swiftshader.png` — SwiftShader mode (nothing works)
- `probe-webgpu.png` — WebGPU flags mode
