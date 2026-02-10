import { useRef, useState, useEffect, type RefObject } from "react";
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import gsap from "gsap";
import { warnMissingTargets, warnDurationMismatch, createRebuildTracker } from "./warnings";

/** Callback that receives the paused timeline and GSAP context for building animations. */
export type UseGSAPCallback = (
  timeline: gsap.core.Timeline,
  context: gsap.Context,
) => void;

export interface UseGSAPOptions {
  /** Override composition fps for seek calculations. */
  fps?: number;
  /** Trigger timeline rebuild when these values change (default: []). */
  dependencies?: unknown[];
}

export interface UseGSAPReturn {
  /** The GSAP timeline instance (paused, controlled via seek). */
  timeline: gsap.core.Timeline;
  /** Ref to attach to the scoping container element. */
  scopeRef: RefObject<HTMLDivElement | null>;
  /** The GSAP context for advanced use (e.g., adding/reverting animations). */
  context: gsap.Context;
}

/**
 * React hook that creates a GSAP timeline synced to Remotion's frame clock.
 *
 * The timeline is paused and advanced via `seek(frame / fps)` each frame,
 * ensuring deterministic, non-sequential rendering for Remotion's screenshot model.
 *
 * Uses `delayRender`/`continueRender` to guarantee the first frame is only
 * captured after GSAP values are applied.
 *
 * @example
 * ```tsx
 * const { scopeRef } = useGSAP((tl) => {
 *   tl.from('.title', { y: 100, opacity: 0, duration: 1 });
 *   tl.from('.subtitle', { opacity: 0, stagger: 0.1 }, '-=0.5');
 * });
 *
 * return <AbsoluteFill ref={scopeRef}>...</AbsoluteFill>;
 * ```
 */
export function useGSAP(
  callback: UseGSAPCallback,
  options?: UseGSAPOptions,
): UseGSAPReturn {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();
  const fps = options?.fps ?? videoConfig.fps;
  const compositionDuration = videoConfig.durationInFrames / fps;
  const deps = options?.dependencies ?? [];

  const scopeRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  const ctxRef = useRef<gsap.Context>(gsap.context(() => {}));
  const hasInitializedRef = useRef(false);
  const rebuildTrackerRef = useRef(createRebuildTracker());

  // delayRender in useState so it's called exactly once per component lifecycle
  const [delayHandle] = useState(() =>
    delayRender("Waiting for GSAP timeline setup"),
  );

  // Build timeline effect — runs on mount and when dependencies change
  useEffect(() => {
    if (!scopeRef.current) return;

    // StrictMode guard: skip the first cleanup+re-invocation cycle
    if (hasInitializedRef.current) {
      rebuildTrackerRef.current.recordRebuild();
    }
    hasInitializedRef.current = true;

    // Create context first with scope, then add animations via ctx.add()
    // This avoids a TDZ issue (ctx is not assigned during gsap.context callback)
    // and matches the pattern used by @gsap/react
    const ctx = gsap.context(() => {}, scopeRef.current);
    const tl = gsap.timeline({ paused: true });

    ctx.add(() => {
      // Let the user build their animations (scoped to scopeRef)
      callback(tl, ctx);
    });

    // Dev-only warnings
    warnMissingTargets(tl);
    warnDurationMismatch(tl, compositionDuration);

    // Initial seek to current frame before signaling ready
    tl.seek(frame / fps);

    timelineRef.current = tl;

    ctxRef.current = ctx;

    // Signal Remotion that the first frame is ready
    continueRender(delayHandle);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Seek to current frame on every frame change
  useEffect(() => {
    timelineRef.current.seek(frame / fps);
  }, [frame, fps]);

  return {
    timeline: timelineRef.current,
    scopeRef,
    context: ctxRef.current,
  };
}
