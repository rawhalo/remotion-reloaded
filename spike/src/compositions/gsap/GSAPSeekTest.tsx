/**
 * Spike 0.1 — Test 1: GSAP seek() determinism
 *
 * Tests whether GSAP's timeline.seek(time) produces identical
 * visual output when called with the same time value, regardless
 * of order or previous seeks.
 *
 * What we're validating:
 * 1. seek(frame/fps) produces correct values at each frame
 * 2. Non-sequential seeking (jump from frame 60 to frame 10) works
 * 3. Values are pure functions of time (no accumulated state)
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const GSAPSeekTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scopeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Create timeline once on mount (paused)
  useEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.from(".box-a", {
        x: -500,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          ".box-b",
          {
            y: 200,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.5"
        )
        .to(
          ".box-a",
          {
            rotation: 360,
            duration: 1,
            ease: "power2.inOut",
          },
          "+=0.2"
        );

      timelineRef.current = tl;
    }, scopeRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, []);

  // Seek to current frame position
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  // Compute expected time for display
  const currentTime = (frame / fps).toFixed(3);
  const totalDuration = (durationInFrames / fps).toFixed(3);

  return (
    <AbsoluteFill
      ref={scopeRef}
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Debug info overlay */}
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
        <div>Frame: {frame} / {durationInFrames}</div>
        <div>Time: {currentTime}s / {totalDuration}s</div>
        <div>FPS: {fps}</div>
      </div>

      {/* Animated elements */}
      <div
        className="box-a"
        style={{
          width: 200,
          height: 200,
          backgroundColor: "#e94560",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 24,
          fontWeight: "bold",
          position: "absolute",
        }}
      >
        BOX A
      </div>

      <div
        className="box-b"
        style={{
          width: 150,
          height: 150,
          backgroundColor: "#0f3460",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 20,
          fontWeight: "bold",
          position: "absolute",
          top: 600,
        }}
      >
        BOX B
      </div>
    </AbsoluteFill>
  );
};
