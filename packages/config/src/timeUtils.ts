/**
 * Convert frames to seconds.
 * Frames are the canonical time unit in Remotion Reloaded.
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Convert seconds to frames (rounded to nearest integer).
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}
