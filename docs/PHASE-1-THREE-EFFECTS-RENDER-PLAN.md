# Phase 1 Closeout: Three + Effects Render Plan

**Status:** Ready for Implementation  
**Owner:** Remotion Reloaded core  
**Purpose:** Make 3D + effects rendering production-safe with a primary single-pass path and a reliable fallback path.  
**Updated:** February 13, 2026

---

## Problem Summary

In real-world stress tests, advanced WebGL effects from `@remotion-reloaded/effects` (for example `pixelate`, `glitch`) can conflict with live `ThreeCanvas` in headless rendering. The failure mode is a render timeout (`delayRender` not cleared).

Current reliable behavior:
- 3D scene alone renders reliably.
- CSS/SVG effects over 3D can work.
- Advanced WebGL effects over live 3D are not guaranteed in single pass.
- 2-pass rendering is reliable today.

---

## Strategy

Use a dual-path architecture:

1. Primary path: **Three-native post-processing** for 3D-first effects in one pass.
2. Fallback path: **Pre-comp pipeline** (2-pass) for combinations that are risky or unsupported in single pass.

This gives strong long-term architecture while preserving immediate production reliability.

---

## Ambiguity Resolution (This Patch)

1. Classifier enforcement ambiguity:
   - Resolved by defining classifier as a **render-time gate**, not only a doctor diagnostic.
2. Pre-comp reproducibility ambiguity:
   - Resolved by defining required artifact schema, metadata, and cache key dimensions.
3. Manual override safety ambiguity:
   - Resolved by defining explicit unsafe override flags and timeout/fallback semantics.
4. Test-gate ambiguity:
   - Resolved by defining mandatory fixture matrix and expected path outcomes.

---

## Runtime Contract (Normative)

This section is normative for implementation. If behavior in code conflicts with this section, this section wins.

### C1. Classifier Input/Output Contract

Classifier input must include:
- composition identity (`compositionId`)
- render mode (`studio`, `render`)
- chrome mode (`headless-shell`, default)
- renderer request (`webgl`, `webgpu`, `auto`)
- scene graph signal (`containsThreeCanvas`)
- normalized effect graph (`effectTypes`, `effectBackends`)
- execution environment (`local`, `lambda`, `cloud-run`, `cloud-run-gpu`)
- relevant render flags (`chromiumOptions.gl`, concurrency, color space)

Classifier output must include:
- `decision`: `single-pass-safe` or `requires-precomp`
- `reasons`: stable machine-readable reason codes plus human-readable text
- `fingerprint`: stable hash of normalized classifier input

Determinism rules:
- Same normalized input must produce the same `decision` and `fingerprint`.
- Any render with `containsThreeCanvas=true` and at least one `webgl-risky` effect in render mode must return `requires-precomp`.

### C2. Enforcement Point

`remotion-reloaded render` is the enforcement point.
- If classifier returns `single-pass-safe`, execute single-pass.
- If classifier returns `requires-precomp`, default behavior is auto-route to pre-comp pipeline.
- `remotion-reloaded doctor` remains advisory and preflight only. Doctor does not enforce policy.

### C3. Manual Override Contract

Unsafe single-pass override must be explicit:
- `--allow-unsafe-single-pass`

Override runtime safeguards:
- `--max-delay-render-ms` default: `120000`
- `--fallback-on-timeout` default: `true`

Timeout behavior when override is enabled:
- With fallback enabled: abort unsafe single-pass attempt and immediately reroute to pre-comp.
- With fallback disabled: fail fast with deterministic non-zero exit code and a clear error reason.

Override logging requirements:
- print classifier `decision`, `reasons`, and `fingerprint`
- print explicit warning banner that output may fail or degrade

### C4. Pre-Comp Artifact + Cache Contract

Pass-1 artifact root:
- `public/renders/pass1/<compositionId>/<cacheKey>/`

Required files:
- `frames/frame-%06d.png`
- `audio/source.wav` (optional if source composition is silent)
- `metadata.json`

Pass-2 output root:
- `public/renders/final/<compositionId>/<cacheKey>/`

Required `metadata.json` fields:
- `compositionId`
- `fps`
- `durationInFrames`
- `width`
- `height`
- `includeAlpha`
- `colorSpace`
- `pixelFormat`
- `chromeMode`
- `chromiumOptions.gl`
- `rendererResolved`
- `inputPropsHash`
- `effectGraphHash`
- `packageVersions`

Cache key must be hash of normalized JSON containing:
- composition id + geometry (`fps`, duration, size)
- normalized input props hash
- normalized effect graph hash
- resolved renderer + chrome mode + relevant chromium flags
- package versions for `@remotion-reloaded/effects` and `@remotion-reloaded/three`

Cache invalidation rules:
- Any mismatch in required metadata invalidates cache.
- `--no-cache` bypasses cache read/write.
- `remotion-reloaded precomp clean` removes stale pass-1 artifacts; default retention is 7 days.

### C5. Audio Contract

Default behavior:
- Pass-1 captures source composition audio as canonical dry mix.
- Pass-2 applies visual effects only unless an effect explicitly declares audio processing support.
- Final output uses pass-1 audio unchanged by default.

### C6. Mandatory CI Fixtures

| Fixture | Setup | Expected classifier | Expected runtime path |
|---------|-------|---------------------|-----------------------|
| `fx-safe-2d` | 2D content + CSS/SVG effects only | `single-pass-safe` | single-pass |
| `three-safe-post` | `ThreeCanvas` + Three-native post stack | `single-pass-safe` | single-pass |
| `three-risky-webgl` | `ThreeCanvas` + `pixelate` or `glitch` in render/headless | `requires-precomp` | pre-comp |
| `three-risky-override` | previous fixture + `--allow-unsafe-single-pass` | `requires-precomp` | override attempt, then timeout fallback or deterministic fail |

---

## Workstreams

### W1. Capability Matrix + Risk Classifier

Goal: classify render setups before final render.

Deliverables:
- Define effect categories: `css-svg-safe`, `three-post-native`, `webgl-risky`.
- Add a compatibility matrix for:
  - render mode (`studio`, `render`)
  - browser mode (`headless-shell`, default)
  - renderer (`webgl`, `webgpu`)
  - effect backend (`css`, `svg`, `webgl`)
- Add classifier utility to return: `single-pass-safe` or `requires-precomp`.
- Return stable reason codes and a classifier fingerprint hash.
- Publish normalized input schema used by classifier and tests.

Acceptance criteria:
- Deterministic classification for known risky combos (`ThreeCanvas + advanced WebGL effect` -> `requires-precomp`).
- Unit tests for matrix decisions.
- Snapshot tests for `decision + reasons + fingerprint`.

### W2. Three-Native Post-Processing Expansion

Goal: make one-pass path strong enough for most 3D workflows.

Deliverables:
- Expand/standardize `@remotion-reloaded/three` post-processing primitives.
- Add ergonomic presets for common looks (cinematic, stylized, glitch-like).
- Document mapping from `@remotion-reloaded/effects` intent -> Three-native stack.

Acceptance criteria:
- At least one documented single-pass preset replacing a current 2-pass use case.
- Integration test snapshots for Three-native post stacks in render mode.

### W3. Pre-Comp Pipeline (First-Class Fallback)

Goal: ship a stable, ergonomic 2-pass system.

Deliverables:
- Add CLI workflow (or script generator) to run:
  1. pass 1: render source composition
  2. pass 2: apply effects composition
- Implement required metadata contract and cache key dimensions from `C4`.
- Implement artifact conventions (`public/renders/pass1/*`, `public/renders/final/*`).
- Add cleanup policy, optional `--no-cache`, and `precomp clean` command.
- Lock pass-2 behavior to visual processing unless audio effect support is explicitly enabled.

Acceptance criteria:
- One command produces deterministic final output for known risky combos.
- Re-run with unchanged inputs reuses pass-1 artifact.
- Metadata mismatch correctly invalidates cache.

### W4. Doctor + UX Guardrails

Goal: prevent users from finding failures late.

Deliverables:
- Extend `remotion-reloaded doctor` with warnings for risky combos and classifier reason codes.
- Print known-stable headless guidance:
  - `chromiumOptions.gl = "angle"`
  - `--chrome-mode=headless-shell`
  - `--concurrency=0` for heavy scenes
- Suggest remediation:
  - use Three-native post-processing
  - or run pre-comp pipeline
- Ensure doctor output matches runtime classifier reason codes (same taxonomy).

Acceptance criteria:
- Doctor returns actionable recommendation before render.
- CI-friendly non-interactive output.
- Doctor output is advisory only and never diverges from runtime classifier for identical input.

### W5. Skills + Documentation

Goal: keep AI guidance and user docs aligned with runtime reality.

Deliverables:
- Update skill rules for:
  - limitation statement
  - decision tree (single-pass vs pre-comp)
  - stable headless flags
- Add cookbook examples:
  - Three-native single-pass
  - Pre-comp 2-pass

Acceptance criteria:
- No contradictory docs between phase spec, skills, and README/docs.

### W6. Test Matrix + Release Gate

Goal: make this behavior enforceable in CI.

Deliverables:
- Integration tests for:
  - safe combos (must pass one-pass)
  - risky combos (must be flagged and/or pass via pre-comp)
- Add release gate checks for classifier behavior and pre-comp command.
- Add mandatory fixture matrix from `C6` to CI.
- Add regression test for unsafe override timeout fallback/fail-fast behavior.

Acceptance criteria:
- CI fails if classifier regression reintroduces unsafe one-pass behavior.
- CI fails if metadata contract or cache invalidation behavior regresses.

---

## Milestones

### M1 (Short Term)
- W1 classifier
- W4 doctor warnings
- W5 docs/skills updates

Result: users get early warning + recommended path before rendering.

### M2 (Near Term)
- W3 pre-comp first-class command
- W6 tests for fallback pipeline

Result: production reliability for all current combos.

### M3 (Mid Term)
- W2 expanded Three-native presets
- W6 one-pass quality/perf validation

Result: more workflows stay single-pass; pre-comp used only when needed.

---

## Recommended Default Policy

- Default to **single-pass** only when classifier says `single-pass-safe`.
- Auto-route to **pre-comp** when classifier says `requires-precomp`.
- Keep manual override for expert users via `--allow-unsafe-single-pass`, with timeout guardrails and explicit warning output.

---

## Definition of Done (Phase 1 Closeout)

- Users can render advanced 3D + effects workflows without timeout failures by following default guidance.
- Runtime classifier enforces safe path selection in render mode.
- `doctor` identifies risky setups and provides exact next action using same reason taxonomy as runtime.
- Pre-comp workflow is documented, tested, and repeatable.
- Pre-comp artifacts are deterministic, cacheable, and invalidated correctly on input drift.
- At least one high-quality Three-native post-processing path is documented as preferred one-pass architecture.
