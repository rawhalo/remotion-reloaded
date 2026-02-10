import type gsap from "gsap";

const PREFIX = "[remotion-reloaded]";

/**
 * Check for GSAP tweens that matched zero DOM elements.
 * This usually means the target selector is wrong or elements
 * are conditionally rendered instead of using visibility:hidden.
 */
export function warnMissingTargets(timeline: gsap.core.Timeline): void {
  if (process.env.NODE_ENV === "production") return;

  const children = timeline.getChildren(true, true, false);
  for (const child of children) {
    const tween = child as gsap.core.Tween;
    if (typeof tween.targets !== "function") continue;
    const targets = tween.targets();
    if (targets.length === 0) {
      const vars = (tween as unknown as { vars?: { _targets?: string } }).vars;
      const selector = vars?._targets ?? "(unknown)";
      console.warn(
        `${PREFIX} GSAP target '${selector}' matched 0 elements. Ensure targets exist at frame 0 (use visibility:hidden, not conditional rendering).`,
      );
    }
  }
}

/**
 * Warn when the GSAP timeline duration exceeds the Remotion composition duration.
 * The timeline will be cut off when the composition ends.
 */
export function warnDurationMismatch(
  timeline: gsap.core.Timeline,
  compositionDurationInSeconds: number,
): void {
  if (process.env.NODE_ENV === "production") return;

  const tlDuration = timeline.duration();
  if (tlDuration > compositionDurationInSeconds) {
    console.warn(
      `${PREFIX} GSAP timeline (${tlDuration.toFixed(1)}s) exceeds composition (${compositionDurationInSeconds.toFixed(1)}s). Timeline will be cut off.`,
    );
  }
}

/**
 * Tracks timeline rebuild frequency. Returns a function that records
 * each rebuild and warns if the threshold is exceeded.
 */
export function createRebuildTracker(threshold = 10): {
  recordRebuild: () => void;
  reset: () => void;
} {
  let count = 0;
  let windowStart = Date.now();

  return {
    recordRebuild() {
      if (process.env.NODE_ENV === "production") return;

      const now = Date.now();
      if (now - windowStart > 1000) {
        count = 0;
        windowStart = now;
      }
      count++;
      if (count > threshold) {
        console.warn(
          `${PREFIX} Timeline rebuilt ${count} times in 1s. Move timeline construction out of render or check dependencies.`,
        );
      }
    },
    reset() {
      count = 0;
      windowStart = Date.now();
    },
  };
}
