import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  warnMissingTargets,
  warnDurationMismatch,
  createRebuildTracker,
} from "../warnings";

// Minimal timeline mock factory
function createMockTimeline(
  children: Array<{ targets: () => unknown[]; vars?: Record<string, unknown> }> = [],
  duration = 1,
) {
  return {
    getChildren: () => children,
    duration: () => duration,
  } as unknown as gsap.core.Timeline;
}

describe("warnings", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    warnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  describe("warnMissingTargets", () => {
    it("warns when a tween has zero matched targets", () => {
      const tl = createMockTimeline([
        { targets: () => [], vars: { _targets: ".missing" } },
      ]);

      warnMissingTargets(tl);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("matched 0 elements"),
      );
    });

    it("does not warn when targets exist", () => {
      const tl = createMockTimeline([
        { targets: () => [document.createElement("div")] },
      ]);

      warnMissingTargets(tl);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("is suppressed in production", () => {
      process.env.NODE_ENV = "production";
      const tl = createMockTimeline([
        { targets: () => [], vars: { _targets: ".missing" } },
      ]);

      warnMissingTargets(tl);

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe("warnDurationMismatch", () => {
    it("warns when timeline exceeds composition duration", () => {
      const tl = createMockTimeline([], 5.0);

      warnDurationMismatch(tl, 3.0);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("exceeds composition"),
      );
    });

    it("does not warn when timeline fits within composition", () => {
      const tl = createMockTimeline([], 2.0);

      warnDurationMismatch(tl, 3.0);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("is suppressed in production", () => {
      process.env.NODE_ENV = "production";
      const tl = createMockTimeline([], 5.0);

      warnDurationMismatch(tl, 3.0);

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe("createRebuildTracker", () => {
    it("warns after exceeding rebuild threshold", () => {
      const tracker = createRebuildTracker(3);

      // 1-3: under threshold
      tracker.recordRebuild();
      tracker.recordRebuild();
      tracker.recordRebuild();
      expect(warnSpy).not.toHaveBeenCalled();

      // 4th: exceeds threshold
      tracker.recordRebuild();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Timeline rebuilt"),
      );
    });

    it("resets count after window expires", () => {
      const tracker = createRebuildTracker(2);
      vi.useFakeTimers();

      tracker.recordRebuild();
      tracker.recordRebuild();

      // Advance past the 1s window
      vi.advanceTimersByTime(1100);

      // Count resets — this should not warn
      warnSpy.mockClear();
      tracker.recordRebuild();
      expect(warnSpy).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("is suppressed in production", () => {
      process.env.NODE_ENV = "production";
      const tracker = createRebuildTracker(1);

      tracker.recordRebuild();
      tracker.recordRebuild();
      tracker.recordRebuild();

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
