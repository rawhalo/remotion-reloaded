import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import type { UseGSAPCallback, UseGSAPOptions, UseGSAPReturn } from "../useGSAP";

// --- Mocks ---

let mockFrame = 0;
const mockFps = 30;
const mockDurationInFrames = 90; // 3 seconds at 30fps
let mockDelayHandle = 1;
let delayRenderCalls: string[] = [];
let continueRenderCalls: number[] = [];

vi.mock("remotion", () => ({
  useCurrentFrame: () => mockFrame,
  useVideoConfig: () => ({
    fps: mockFps,
    durationInFrames: mockDurationInFrames,
    width: 1920,
    height: 1080,
  }),
  delayRender: (label?: string) => {
    delayRenderCalls.push(label ?? "");
    return mockDelayHandle++;
  },
  continueRender: (handle: number) => {
    continueRenderCalls.push(handle);
  },
}));

// GSAP mock — track all calls
const seekCalls: number[] = [];
const revertCalls: number[] = [];
let contextCounter = 0;

function createMockTimeline() {
  return {
    seek: vi.fn((time: number) => {
      seekCalls.push(time);
    }),
    paused: vi.fn(() => true),
    duration: vi.fn(() => 1),
    getChildren: vi.fn(() => []),
    from: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
  };
}

vi.mock("gsap", () => {
  return {
    default: {
      timeline: vi.fn(() => createMockTimeline()),
      context: vi.fn((cb: () => void, _scope?: unknown) => {
        cb();
        const id = contextCounter++;
        return {
          revert: vi.fn(() => revertCalls.push(id)),
          add: vi.fn((addCb: () => void) => addCb()),
        };
      }),
    },
  };
});

vi.mock("../warnings", () => ({
  warnMissingTargets: vi.fn(),
  warnDurationMismatch: vi.fn(),
  createRebuildTracker: () => ({
    recordRebuild: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Import after mocks
const { useGSAP } = await import("../useGSAP");
const gsap = (await import("gsap")).default;
const { warnMissingTargets, warnDurationMismatch } = await import(
  "../warnings"
);

// --- Test component that renders a real div with scopeRef ---
let lastResult: UseGSAPReturn | null = null;

function TestComponent({
  callback,
  options,
}: {
  callback: UseGSAPCallback;
  options?: UseGSAPOptions;
}) {
  const result = useGSAP(callback, options);
  lastResult = result;
  return React.createElement("div", { ref: result.scopeRef, "data-testid": "scope" });
}

function renderWithHook(callback?: UseGSAPCallback, options?: UseGSAPOptions) {
  const cb = callback ?? (() => {});
  const result = render(
    React.createElement(TestComponent, { callback: cb, options }),
  );
  return { ...result, getResult: () => lastResult! };
}

describe("useGSAP", () => {
  beforeEach(() => {
    mockFrame = 0;
    mockDelayHandle = 1;
    delayRenderCalls = [];
    continueRenderCalls = [];
    seekCalls.length = 0;
    revertCalls.length = 0;
    contextCounter = 0;
    lastResult = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("creates a paused timeline", () => {
    renderWithHook();

    expect(gsap.timeline).toHaveBeenCalledWith(
      expect.objectContaining({ paused: true }),
    );
  });

  it("calls callback with timeline and context", () => {
    const callback = vi.fn();
    renderWithHook(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ seek: expect.any(Function) }),
      expect.any(Object),
    );
  });

  it("seeks to frame 0 on mount", () => {
    mockFrame = 0;
    renderWithHook();

    // seek(0/30) = seek(0)
    expect(seekCalls).toContain(0);
  });

  it("seeks on frame change", () => {
    mockFrame = 15;
    renderWithHook();

    // seek(15/30) = seek(0.5) from the build effect
    // plus seek(15/30) = 0.5 from the sync effect
    expect(seekCalls).toContain(0.5);
  });

  it("calls delayRender on mount", () => {
    renderWithHook();

    expect(delayRenderCalls.length).toBeGreaterThanOrEqual(1);
    expect(delayRenderCalls[0]).toBe("Waiting for GSAP timeline setup");
  });

  it("calls continueRender after setup", () => {
    renderWithHook();

    expect(continueRenderCalls.length).toBeGreaterThanOrEqual(1);
    // First delayHandle is 1
    expect(continueRenderCalls[0]).toBe(1);
  });

  it("scopes context to scopeRef element", () => {
    renderWithHook();

    // The effect call to gsap.context should receive the DOM element
    const contextCalls = (gsap.context as ReturnType<typeof vi.fn>).mock.calls;
    // Find the call from the effect (not the ref initializer)
    const effectCall = contextCalls.find(
      (call: unknown[]) => call[1] != null && call[1] instanceof HTMLElement,
    );
    expect(effectCall).toBeDefined();
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderWithHook();

    unmount();

    // ctx.revert() should have been called
    expect(revertCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("handles React StrictMode double invocation", () => {
    const callback = vi.fn();

    // First mount + unmount
    const { unmount } = renderWithHook(callback);
    unmount();

    // Second mount — should not throw
    const { unmount: unmount2 } = renderWithHook(callback);
    unmount2();

    expect(true).toBe(true);
  });

  it("uses custom fps from options", () => {
    mockFrame = 12;
    renderWithHook(undefined, { fps: 24 });

    // seek(12/24) = seek(0.5)
    expect(seekCalls).toContain(0.5);
  });

  it("rebuilds on dependency change", () => {
    const callback = vi.fn();

    const { rerender } = render(
      React.createElement(TestComponent, {
        callback,
        options: { dependencies: ["a"] },
      }),
    );

    vi.clearAllMocks();
    seekCalls.length = 0;
    revertCalls.length = 0;

    // Re-render with different dependencies
    rerender(
      React.createElement(TestComponent, {
        callback,
        options: { dependencies: ["b"] },
      }),
    );

    // Old context should be reverted, new callback invoked
    expect(revertCalls.length).toBeGreaterThanOrEqual(1);
    expect(callback).toHaveBeenCalled();
  });

  it("calls warnMissingTargets during setup", () => {
    renderWithHook();

    expect(warnMissingTargets).toHaveBeenCalled();
  });

  it("calls warnDurationMismatch during setup", () => {
    renderWithHook();

    expect(warnDurationMismatch).toHaveBeenCalledWith(
      expect.any(Object),
      mockDurationInFrames / mockFps,
    );
  });

  it("handles empty callback without error", () => {
    expect(() => renderWithHook(() => {})).not.toThrow();
  });

  it("returns scopeRef, timeline, and context", () => {
    renderWithHook();

    const result = lastResult!;
    expect(result).toHaveProperty("scopeRef");
    expect(result).toHaveProperty("timeline");
    expect(result).toHaveProperty("context");
    expect(result.scopeRef).toHaveProperty("current");
  });
});
