import { describe, it, expect } from "vitest";
import { framesToSeconds, secondsToFrames } from "../timeUtils";

describe("timeUtils", () => {
  it("converts frames to seconds at 30fps", () => {
    expect(framesToSeconds(30, 30)).toBe(1);
    expect(framesToSeconds(15, 30)).toBe(0.5);
    expect(framesToSeconds(0, 30)).toBe(0);
  });

  it("converts frames to seconds at 60fps", () => {
    expect(framesToSeconds(60, 60)).toBe(1);
    expect(framesToSeconds(30, 60)).toBe(0.5);
  });

  it("converts seconds to frames at 30fps", () => {
    expect(secondsToFrames(1, 30)).toBe(30);
    expect(secondsToFrames(0.5, 30)).toBe(15);
    expect(secondsToFrames(0, 30)).toBe(0);
  });

  it("rounds to nearest frame", () => {
    expect(secondsToFrames(0.033, 30)).toBe(1); // 0.99 → 1
    expect(secondsToFrames(0.1, 30)).toBe(3); // 3.0 → 3
  });
});
