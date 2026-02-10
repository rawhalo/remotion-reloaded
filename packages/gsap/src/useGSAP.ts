import type { RefObject } from "react";

export interface UseGSAPOptions {
  /** Frames per second, defaults to composition fps */
  fps?: number;
}

export interface UseGSAPReturn {
  /** The GSAP timeline instance (paused, controlled via seek) */
  timeline: any; // gsap.core.Timeline — typed as any to avoid hard dep in stub
  /** Ref to attach to the scoping container element */
  scopeRef: RefObject<HTMLDivElement | null>;
}

/**
 * React hook that creates a GSAP timeline synced to Remotion's frame clock.
 *
 * The timeline is paused and advanced via `seek(frame / fps)` each frame,
 * ensuring deterministic, non-sequential rendering for Remotion's screenshot model.
 *
 * @example
 * ```tsx
 * const { timeline, scopeRef } = useGSAP();
 *
 * useEffect(() => {
 *   timeline
 *     .from('.title', { y: 100, opacity: 0, duration: 1 })
 *     .from('.subtitle', { opacity: 0 }, '-=0.5');
 * }, []);
 *
 * return <AbsoluteFill ref={scopeRef}>...</AbsoluteFill>;
 * ```
 */
export function useGSAP(_options?: UseGSAPOptions): UseGSAPReturn {
  // TODO: Task 1.3 — full implementation
  // - Create paused timeline with gsap.context() scoped to scopeRef
  // - Use delayRender/continueRender for first frame
  // - Seek to frame/fps on every frame change
  // - Clean up with ctx.revert() on unmount
  throw new Error(
    "useGSAP is not yet implemented. See Task 1.3 in the implementation plan.",
  );
}
