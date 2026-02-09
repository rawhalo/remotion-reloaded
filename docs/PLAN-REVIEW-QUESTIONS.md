# Plan Review: Open Questions and Concerns

**Purpose:** Capture the unresolved questions, risks, and spec inconsistencies that must be answered before implementation begins.

---

## Critical Open Questions (Must Answer Before Build)

1. Effects rendering model
- Does `<Effect>` support arbitrary React/DOM children, or only specific render targets (canvas/video/image/Three)?
- If it supports DOM, what is the deterministic DOM-to-texture pipeline per frame, and what are the explicit limitations?
- What is the compositing order with nested effects and multiple effects on the same subtree?
- How are alpha, blend modes, and color management handled across WebGL/WebGPU and CSS fallbacks?

2. GSAP timeline determinism
- How do we guarantee timeline construction and `seek()` occur before the first frame is captured in `renderStill` and `renderFrames`?
- What is the required contract for elements inside `Sequence` or conditionally rendered nodes (e.g., must targets be mounted at frame 0)?
- How does `useGSAP()` behave under React StrictMode double-invocation and rerenders?

3. WebGPU/WebGL environment support
- Which environments are P0 supported for WebGPU and for WebGL fallback (local preview, local render, Lambda, Cloud Run GPU)?
- What is the minimum 3D/effects experience guaranteed on Lambda, and what is explicitly skipped?
- How do we validate this support matrix with tests and CI?

4. GSAP Club plugins licensing and distribution
- Are Club plugins part of the shipped package, or user-provided only?
- What is the compliance-safe install story for both open-source and commercial users?
- How will errors, docs, and example code handle the “plugin not licensed/installed” scenario?

5. Repo vs implementation location
- Is this repository the future monorepo (pnpm/turbo) or a spec-only repo?
- If monorepo, when does the structure change and how do we avoid breaking doc links and paths?

6. Phase 1 scope boundary
- What is the smallest shippable wedge that proves the vision and de-risks the architecture?
- Which deliverables are strictly MVP vs stretch (CLI, serverless fallbacks, full effects catalog, visual regression, etc.)?

---

## High-Risk Concerns (Technical)

1. Effects abstraction might be misleading
- The docs promise “wrap content in `<Effect>`” without a defined rendering pipeline. This is likely the hardest part of the project.

2. GSAP sync failure modes are under-specified
- Element availability, render timing, and deterministic first-frame behavior are not defined.

3. WebGPU assumptions may be wrong for headless/CI
- The stated browser version matrix appears questionable and could lead to a WebGPU-first API that is not actually shippable.

4. Serverless fallback complexity
- Fallback logic for effects, particles, and Three in Lambda is extensive and may inflate Phase 1 beyond schedule.

5. Performance and determinism
- No explicit strategy for seed-based determinism, render reproducibility, or performance baselines per environment.

---

## Spec Conflicts and Doc Gaps

1. Timeline inconsistency
- Phase 1 timeline is 4–6 weeks in `README.md` and `PRD.md`, but 6–8 weeks in `PHASE-1-TECHNICAL-FOUNDATION.md`.

2. Broken or mismatched doc links
- `README.md` references `PLAN_ASSESSMENT_AND_IDEAS.md` at root, but it is in `archive/`.
- `PRD.md` links to `./docs/phase-*.md` and `./skill/SKILL.md`, which do not exist.

3. Skills packaging is inconsistent
- Three conflicting structures are described: `skills/` in this repo, `skill-examples/` at root, and a separate `remotion-reloaded-skill/` repo.

4. Guidance contradictions
- “Never use CSS transitions” is stated, but Phase 3 beat-sync example uses CSS transitions.
- “Never use `useFrame()` from R3F” is stated, but the root `SKILL.md` imports it in a Three.js example.

5. Example code completeness
- Several code snippets omit required imports (`interpolate`, `useCurrentFrame`, `useRef`), which hurts copy/paste and AI generation reliability.

---

## Decisions Required Before Implementation

1. Effects API scope
- Define the exact supported input types for `<Effect>` in v1 and document any unsupported child types.

2. GSAP timeline contract
- Define whether targets must exist at frame 0 and how late-mounting targets are handled.

3. Environment support policy
- Explicitly list supported environments and which features degrade or are disabled in each.

4. Licensing stance for GSAP Club
- Decide whether Club plugins are a core requirement or optional add-ons.

5. Repo structure and ownership
- Decide whether this repo becomes the monorepo or remains docs-only.

6. MVP slice for Phase 1
- Pick a minimal subset that is both demonstrably valuable and technically de-risking.

---

## Proposed Next Actions (If You Want a Quick Path to Implementation)

1. Write a one-page “Effects Rendering Model” spec (input types, compositing, fallbacks, deterministic rendering).
2. Decide the GSAP Club plugin policy and update all docs to match.
3. Freeze a Phase 1 MVP and move all other deliverables to Phase 1.5 or Phase 2.
4. Align all timelines, links, and skill packaging descriptions across docs.

---

**Last updated:** February 8, 2026
