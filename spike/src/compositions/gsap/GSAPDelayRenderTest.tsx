/**
 * Spike 0.1 — Test 2: delayRender / continueRender integration
 *
 * Tests whether using Remotion's delayRender() before timeline
 * construction and continueRender() after first seek() ensures
 * the frame isn't captured before GSAP values are applied.
 *
 * What we're validating:
 * 1. delayRender() prevents premature frame capture
 * 2. continueRender() signals readiness after GSAP seek
 * 3. First frame (frame 0) shows correct initial state
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
} from "remotion";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export const GSAPDelayRenderTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scopeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [delayHandle] = useState(() => delayRender("Waiting for GSAP timeline setup"));
  const hasInitialized = useRef(false);

  // Create timeline and do initial seek
  useEffect(() => {
    if (!scopeRef.current || hasInitialized.current) return;
    hasInitialized.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Elements should start at their "from" position at frame 0
      tl.from(".delay-box", {
        x: -800,
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: "power3.out",
      }).from(
        ".delay-label",
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.8"
      );

      timelineRef.current = tl;

      // Do initial seek before signaling ready
      tl.seek(frame / fps);

      // Now safe to render
      continueRender(delayHandle);
    }, scopeRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, [delayHandle, frame, fps]);

  // Seek on subsequent frames
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill
      ref={scopeRef}
      style={{
        backgroundColor: "#16213e",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Debug info */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "#fff",
          fontSize: 16,
          opacity: 0.8,
          fontFamily: "monospace",
        }}
      >
        <div>Test: delayRender/continueRender</div>
        <div>Frame: {frame}</div>
        <div>
          Expected at frame 0: box should be at x=-800, opacity=0, scale=0.5
        </div>
      </div>

      <div
        className="delay-box"
        style={{
          width: 300,
          height: 300,
          backgroundColor: "#e94560",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          className="delay-label"
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "bold",
          }}
        >
          DELAY RENDER TEST
        </div>
      </div>
    </AbsoluteFill>
  );
};
