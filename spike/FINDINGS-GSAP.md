# Spike 0.1: GSAP seek() Determinism in Remotion — Findings

**Date:** 2026-02-08
**Environment:** macOS (Darwin 25.2.0), Node 25.5.0, Remotion 4.0.420, GSAP 3.14.2, React 19.2.4
**Chrome:** Headless Shell 144.0.7559.20 (arm64)

---

## Test Results Summary

| Test | Result | Details |
|------|--------|---------|
| Deterministic rendering | **PASS** | 3 renders of frame 30 produce identical SHA-256 hashes |
| Non-sequential seeking | **PASS** | Frame 10 is identical whether rendered before or after frame 60 |
| delayRender/continueRender | **PASS** | Frame 0 renders correctly with delay pattern |
| Target lifecycle | **PASS (with caveats)** | See detailed findings below |

## Key Findings

### 1. GSAP seek() is fully deterministic in Remotion

`timeline.seek(frame / fps)` produces **byte-identical** PNG output across multiple renders of the same frame. GSAP applies all tween values synchronously during `seek()`, making it a pure function of time. This is the core requirement for Remotion integration and it works perfectly.

### 2. Non-sequential seeking works correctly

Rendering frame 10, then frame 60, then frame 10 again produces the same output for frame 10 both times. GSAP's `seek()` does not accumulate state — it jumps to the exact position and applies values as if the animation had played to that point. This means Remotion can render frames in any order (as it does in Lambda parallel rendering) without issues.

### 3. delayRender/continueRender pattern works

The pattern is:
```tsx
const [handle] = useState(() => delayRender("Waiting for GSAP"));

useEffect(() => {
  // Build timeline...
  timeline.seek(frame / fps);
  continueRender(handle);
}, []);
```

This prevents Remotion from capturing the frame before GSAP values are applied. **Confirmed working.** Without this pattern, there's a theoretical risk of Remotion screenshotting before `useEffect` runs, but in practice Remotion's rendering pipeline already waits for effects to settle. The `delayRender` pattern adds an explicit guarantee.

### 4. Target lifecycle: critical finding

**Elements inside `<Sequence>` break GSAP targeting.**

When GSAP builds the timeline in `useEffect`, it queries the DOM for targets (e.g., `.sequence-mounted`). If that element is inside `<Sequence from={30}>`, it is **not mounted** at frame 0 when the timeline is created. GSAP logs:

```
GSAP target .sequence-mounted not found. https://gsap.com
```

The tween is silently skipped. When the element mounts at frame 30, it appears at its default CSS position **without any GSAP animation**.

**The `visibility: hidden` pattern works correctly.** An element that is always in the DOM but hidden via `visibility: hidden` until the appropriate frame is found by GSAP, animated correctly, and becomes visible when the frame arrives.

### Recommended Target Lifecycle Contract

For `@remotion-reloaded/gsap`:
1. **All GSAP animation targets MUST be mounted at frame 0** (in the DOM when `useEffect` runs)
2. For elements that should appear later, use `visibility: hidden` (or `opacity: 0`) instead of conditional rendering or `<Sequence>`
3. The `useGSAP` hook should warn when targets are not found, with a message explaining this constraint
4. Consider a `<GSAPSequence>` component that keeps children in the DOM but controls visibility, as a convenience wrapper

## GSAP Integration Pattern (Confirmed Working)

```tsx
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const MyComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scopeRef = useRef(null);
  const timelineRef = useRef(null);
  const [handle] = useState(() => delayRender("GSAP setup"));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.from(".target", { x: -500, opacity: 0, duration: 1, ease: "power3.out" });
      timelineRef.current = tl;
      tl.seek(frame / fps);
      continueRender(handle);
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    timelineRef.current?.seek(frame / fps);
  }, [frame, fps]);

  return <div ref={scopeRef}>...</div>;
};
```

## Performance Notes

- Bundle time: ~3-4 seconds (webpack)
- Render per frame (with Chrome launch overhead): ~500-900ms
- Subsequent renders (Chrome reused): ~400-500ms
- GSAP seek() overhead: negligible (sub-millisecond)

## Output Images

All test images are in `spike/out/gsap-test/`:
- `seek-frame30-run[0-2].png` — Determinism test (identical)
- `seek-frame10-baseline.png` / `seek-frame10-after60.png` — Non-sequential test (identical)
- `delay-render-frame0.png` / `delay-render-frame45.png` — delayRender test
- `lifecycle-frame[0,45,89].png` — Target lifecycle test
