/**
 * Spike 0.1 — Test 3: GSAP target lifecycle
 *
 * Tests what happens when GSAP animation targets are:
 * 1. Always mounted (normal case — should work)
 * 2. Inside a <Sequence from={30}> (not mounted at frame 0)
 * 3. Mounted but with visibility:hidden (recommended pattern)
 *
 * This validates the target lifecycle contract:
 * "All GSAP targets must be mounted at frame 0"
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const GSAPTargetLifecycleTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scopeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Case 1: Always-mounted target (should work fine)
      tl.from(".always-mounted", {
        x: -400,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });

      // Case 2: Target inside <Sequence> — NOT mounted at frame 0
      // This tween targets an element that may not exist yet
      tl.from(
        ".sequence-mounted",
        {
          y: 200,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        0.5
      );

      // Case 3: visibility:hidden target — always in DOM but hidden
      tl.from(
        ".hidden-mounted",
        {
          scale: 0,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.7)",
        },
        1
      );

      timelineRef.current = tl;
    }, scopeRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <AbsoluteFill
      ref={scopeRef}
      style={{
        backgroundColor: "#0a0a23",
        padding: 60,
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
          fontSize: 14,
          opacity: 0.8,
          fontFamily: "monospace",
        }}
      >
        <div>Test: Target Lifecycle</div>
        <div>Frame: {frame}</div>
      </div>

      {/* Case 1: Always mounted — should animate normally */}
      <div
        style={{
          marginTop: 80,
          marginBottom: 40,
          color: "#4ade80",
          fontSize: 14,
          fontFamily: "monospace",
        }}
      >
        Case 1: Always Mounted (expected: works)
      </div>
      <div
        className="always-mounted"
        style={{
          width: 200,
          height: 80,
          backgroundColor: "#4ade80",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          fontWeight: "bold",
        }}
      >
        ALWAYS MOUNTED
      </div>

      {/* Case 2: Inside Sequence — not mounted until frame 30 */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 40,
          color: "#f97316",
          fontSize: 14,
          fontFamily: "monospace",
        }}
      >
        Case 2: Inside Sequence from=30 (expected: may break)
      </div>
      <Sequence from={30}>
        <div
          className="sequence-mounted"
          style={{
            width: 200,
            height: 80,
            backgroundColor: "#f97316",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          SEQUENCE MOUNTED
        </div>
      </Sequence>

      {/* Case 3: visibility:hidden pattern — always in DOM */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 40,
          color: "#60a5fa",
          fontSize: 14,
          fontFamily: "monospace",
        }}
      >
        Case 3: visibility:hidden until frame 30 (expected: works)
      </div>
      <div
        className="hidden-mounted"
        style={{
          width: 200,
          height: 80,
          backgroundColor: "#60a5fa",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          fontWeight: "bold",
          visibility: frame < 30 ? "hidden" : "visible",
        }}
      >
        HIDDEN MOUNTED
      </div>
    </AbsoluteFill>
  );
};
