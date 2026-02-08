# Future Ideas: Out of Scope for Current Roadmap

**Created:** January 30, 2026
**Source:** Plan Assessment by Antigravity + Critical Analysis
**Status:** Parking lot for future consideration

---

## Overview

These ideas were evaluated during roadmap planning and determined to be either:
- **Out of scope** — Would require significant architectural changes
- **Different product** — Better suited as a separate tool/project
- **Premature optimization** — Solving problems we don't have yet
- **Nice-to-have** — Valuable but not essential for core vision

Each idea is preserved here with analysis of why it was deferred and what would be required to revisit it.

---

## 1. Remotion Interactive (Phase 5 Proposal)

### Original Proposal
Export compositions as interactive web components (`<remotion-interactive-player>`) instead of MP4s. Maintain live GSAP/Three.js animations with mouse interaction (tilt, hover) and client-side data injection.

### Why Deferred
- **Architectural mismatch**: Remotion's core is frame-by-frame rendering to video files. Converting to interactive runtime would require rewriting the composition model.
- **Scope creep**: This is effectively a different product (interactive video player) rather than an enhancement.
- **Existing solutions**: Projects like Theatre.js, Lottie, and GSAP already serve this use case well.

### What Would Be Required to Revisit
1. Separate "export to web" pipeline that preserves animation code
2. Runtime player SDK with state management
3. Handling branching narratives and user input
4. Performance optimization for real-time playback
5. Different testing/QA approach (user interaction paths)

### Recommendation
If there's demand, build as a separate product: "Remotion Web Player" or similar. Keep the core Remotion Reloaded focused on rendered video excellence.

---

## 2. Director's Monitor (Real-Time Tuning UI)

### Original Proposal
A UI overlay for the Remotion Player with semantic sliders ("Energy," "Chaos," "Zoom Intensity") that use LLM logic to rewrite component props in real-time. Includes "Freeze & Fix" with voice commands.

### Why Deferred
- **Different product category**: This describes an IDE/studio experience, not a library feature.
- **Latency concerns**: LLM-based code rewriting during playback would cause jarring re-renders.
- **Complex infrastructure**: Voice → intent parsing → code generation → hot reload is significant scope.

### What Would Be Required to Revisit
1. Separate "Remotion Reloaded Studio" application
2. Real-time code patching system with hot module replacement
3. Voice recognition integration (Web Speech API or similar)
4. Intent parsing model fine-tuned for video editing commands
5. Scoped patching that doesn't break composition state

### Partial Implementation Available Now
The core need (tweaking semantic parameters without editing code) is solvable with Remotion's existing `inputProps` + a simple control panel UI. Consider building a basic version as a dev tool.

---

## 3. Hybrid GSAP Sync

### Original Proposal
Support a "Hybrid Mode" where simple tweens are baked to Remotion keyframes (for performance) while complex timelines remain managed by GSAP.

### Why Deferred
- **Premature optimization**: We don't yet have evidence that GSAP sync is a performance bottleneck.
- **Added complexity**: Two code paths for animations increases maintenance burden and debugging difficulty.
- **Unclear heuristics**: How do you determine what's "simple"? Adds cognitive load for users.

### What Would Be Required to Revisit
1. Performance benchmarking showing GSAP sync is a bottleneck
2. Clear, user-understandable criteria for "simple" vs "complex"
3. Build-time analyzer that categorizes animations
4. Transparent fallback when baking fails

### Recommendation
Ship Phase 1 with pure GSAP sync. If performance issues emerge in real usage, revisit with data.

---

## 4. Shader Playground (Visual Node Editor)

### Original Proposal
A dev-tool node graph editor for the Shader Effects system, allowing users to visually combine effects and export React code.

### Why Deferred
- **Not essential for core value**: The declarative `<Effect>` API is already easy to use.
- **Tooling scope**: This is a developer tool, not a library feature.
- **Community contribution candidate**: Well-suited for open-source contribution.

### What Would Be Required to Revisit
1. Node-based editor UI (similar to Unity Shader Graph, Blender nodes)
2. Serialization format for effect graphs
3. Code generation from graph to React components
4. Preview rendering within the editor

### Recommendation
If there's community interest, spec out as a standalone dev tool. Could be a great first contribution opportunity.

---

## 5. A/B Testing Driver (Auto-Evolving Aesthetics)

### Original Proposal
Auto-generate variants, measure click-through, and auto-evolve the best aesthetic over time.

### Why Deferred
- **Infrastructure scope**: This requires analytics pipelines, experiment frameworks, and feedback loops.
- **Different domain**: A/B testing is a product/growth concern, not a video creation concern.
- **Platform dependency**: Requires integration with ad platforms, analytics tools, etc.

### What Would Be Required to Revisit
1. Analytics SDK integration (GA4, Mixpanel, etc.)
2. Experiment assignment system
3. Feedback loop from analytics to rendering
4. Variant generation strategy (genetic algorithms, random sampling, etc.)
5. Statistical significance calculations

### Recommendation
Build variant generation first (Phase 4). A/B testing can be added as a separate "Remotion Analytics" product later if there's enterprise demand.

---

## 6. Real-Time Client-Side Rendering SDK

### Original Proposal
Ship a runtime that renders Remotion compositions in the browser in real-time, enabling "zero-render" personalization.

### Why Deferred
- **Different deployment model**: Remotion is designed for server-side rendering to video files.
- **Performance concerns**: Complex effects and Three.js scenes may not run smoothly on all client devices.
- **Quality consistency**: Server-rendering guarantees consistent output; client rendering varies by device.

### What Would Be Required to Revisit
1. Lightweight player runtime (subset of Remotion)
2. Effect fallbacks for low-powered devices
3. Progressive rendering / quality levels
4. Asset preloading and caching strategy
5. Cross-browser testing matrix

### Recommendation
For simple personalizations (text, colors), consider a separate lightweight player. Keep complex rendering server-side.

---

## 7. Interactive Video Triggers (Click-to-Buy, Branch Narratives)

### Original Proposal
Support clickable regions in videos that trigger actions (purchase, branch to different scene, etc.)

### Why Deferred
- **Requires interactive runtime**: See "Remotion Interactive" above.
- **Platform-specific**: Each platform (YouTube, TikTok, web) handles interactivity differently.
- **Content strategy scope**: Branching narratives require content planning, not just technical capability.

### What Would Be Required to Revisit
1. Interactive player runtime
2. Hotspot definition system
3. Branching logic / state machine
4. Platform-specific export (YouTube cards, web overlays, etc.)
5. Analytics for interaction tracking

### Recommendation
If pursuing interactive video, tackle as a dedicated product post-Phase 4.

---

## 8. Full Saliency-Based Layout (Real-Time CV)

### Original Proposal
Run ML saliency detection on every frame to dynamically position text/graphics in negative space.

### Why Deferred (as real-time feature)
- **Performance cost**: Running ML inference per frame is expensive.
- **Complexity**: Requires ML model deployment, likely WASM or server-side.
- **80/20 exists**: Pre-computed saliency analysis covers most use cases.

### What Was Included
- **Phase 3 stretch goal**: Pre-computed saliency analysis for uploaded footage
- **Static safe zones**: Platform-specific zones cover 80% of use cases

### What Would Be Required for Full Version
1. Efficient saliency model (MobileNet-based or similar)
2. WASM deployment for client-side inference
3. Frame-to-frame smoothing to avoid jitter
4. Fallback for when saliency data is unavailable

---

## 9. Full Semantic Audio Sync (LLM-Powered)

### Original Proposal
Use LLM to analyze lyrics/speech semantically and trigger visual events based on meaning (e.g., "skyrocket" → graph goes up).

### Why Deferred (as core feature)
- **Latency**: LLM inference adds processing time to audio analysis.
- **Accuracy**: Semantic interpretation is subjective and may not match user intent.
- **Complexity**: Requires transcript → LLM → timing alignment pipeline.

### What Was Included
- **Phase 3 stretch goal**: Basic semantic timing with keyword detection
- **Core feature**: Beat/amplitude sync which covers most music-reactive use cases

### What Would Be Required for Full Version
1. Fine-tuned model for video timing commands
2. User-adjustable sensitivity per keyword
3. Override/manual correction UI
4. Pre-processing step (not real-time)

---

## How to Promote Ideas from This List

If you want to move an idea from "Future" to "Active":

1. **Validate demand**: Do users/customers actually want this?
2. **Scope it**: Write a one-page spec with clear boundaries
3. **Estimate effort**: How many weeks? What dependencies?
4. **Identify risks**: What could go wrong? What's the fallback?
5. **Assign to phase**: Does it fit an existing phase or need its own?

---

## Summary Table

| Idea | Why Deferred | Effort to Revisit | Priority |
|------|--------------|-------------------|----------|
| Remotion Interactive | Different product | High (3-6 months) | Low |
| Director's Monitor | Tooling scope | Medium (6-8 weeks) | Medium |
| Hybrid GSAP Sync | Premature optimization | Low (2-3 weeks) | Low |
| Shader Playground | Nice-to-have | Medium (4-6 weeks) | Low |
| A/B Testing Driver | Infrastructure scope | High (2-3 months) | Medium |
| Client-Side Rendering | Different deployment | High (3-4 months) | Low |
| Interactive Triggers | Requires runtime | High (3-6 months) | Low |
| Full Saliency Layout | Performance cost | Medium (4-6 weeks) | Medium |
| Full Semantic Audio | Accuracy concerns | Medium (3-4 weeks) | Medium |

---

*Last updated: January 30, 2026*
