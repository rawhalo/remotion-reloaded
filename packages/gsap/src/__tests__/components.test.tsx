import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import type gsap from "gsap";
import type { UseGSAPCallback, UseGSAPOptions, UseGSAPReturn } from "../useGSAP";

const useGSAPMock = vi.fn();
const gsapTimelineMock = vi.fn();

vi.mock("../useGSAP", () => ({
  useGSAP: (callback: UseGSAPCallback, options?: UseGSAPOptions): UseGSAPReturn =>
    useGSAPMock(callback, options),
}));

vi.mock("gsap", () => ({
  default: {
    timeline: (vars?: unknown) => gsapTimelineMock(vars),
  },
}));

const { GSAPTimeline } = await import("../components/GSAPTimeline");
const { GSAPFrom } = await import("../components/GSAPFrom");
const { GSAPTo } = await import("../components/GSAPTo");
const { GSAPSequence } = await import("../components/GSAPSequence");

function createTimelineRecorder() {
  return {
    from: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
  };
}

let capturedCallback: UseGSAPCallback | null = null;
let capturedOptions: UseGSAPOptions | undefined;

function getCapturedCallback(): UseGSAPCallback {
  if (!capturedCallback) {
    throw new Error("Expected GSAPTimeline to register a useGSAP callback.");
  }
  return capturedCallback;
}

describe("GSAP declarative components", () => {
  beforeEach(() => {
    capturedCallback = null;
    capturedOptions = undefined;
    useGSAPMock.mockReset();
    gsapTimelineMock.mockReset();

    useGSAPMock.mockImplementation(
      (callback: UseGSAPCallback, options?: UseGSAPOptions): UseGSAPReturn => {
        capturedCallback = callback;
        capturedOptions = options;
        return {
          timeline: createTimelineRecorder() as unknown as gsap.core.Timeline,
          scopeRef: { current: null },
          context: {} as gsap.Context,
        };
      },
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders non-instruction children inside GSAPTimeline", () => {
    render(
      <GSAPTimeline>
        <GSAPFrom target=".title" vars={{ opacity: 0 }} />
        <div data-testid="payload">content</div>
      </GSAPTimeline>,
    );

    expect(screen.getByTestId("payload")).toBeDefined();
  });

  it("builds from/to tweens with position and stagger", () => {
    render(
      <GSAPTimeline>
        <GSAPFrom
          target=".title"
          vars={{ opacity: 0 }}
          duration={1}
          ease="power3.out"
          position="-=0.5"
        />
        <GSAPTo
          target=".subtitle"
          vars={{ x: 120 }}
          stagger={0.1}
          position="intro"
        />
      </GSAPTimeline>,
    );

    const rootTimeline = createTimelineRecorder();
    getCapturedCallback()(rootTimeline as unknown as gsap.core.Timeline, {} as gsap.Context);

    expect(rootTimeline.from).toHaveBeenCalledWith(
      ".title",
      expect.objectContaining({
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      }),
      "-=0.5",
    );

    expect(rootTimeline.to).toHaveBeenCalledWith(
      ".subtitle",
      expect.objectContaining({
        x: 120,
        stagger: 0.1,
      }),
      "intro",
    );
  });

  it("builds nested timelines with GSAPSequence and adds them at the given position", () => {
    const nestedTimeline = createTimelineRecorder();
    gsapTimelineMock.mockReturnValue(nestedTimeline);

    render(
      <GSAPTimeline>
        <GSAPSequence position="main">
          <GSAPFrom target=".card" vars={{ opacity: 0, y: 40 }} />
          <GSAPTo target=".card" vars={{ opacity: 1, y: 0 }} position="+=0.2" />
        </GSAPSequence>
      </GSAPTimeline>,
    );

    const rootTimeline = createTimelineRecorder();
    getCapturedCallback()(rootTimeline as unknown as gsap.core.Timeline, {} as gsap.Context);

    expect(gsapTimelineMock).toHaveBeenCalledWith({ paused: true });
    expect(nestedTimeline.from).toHaveBeenCalledWith(
      ".card",
      expect.objectContaining({ opacity: 0, y: 40 }),
      undefined,
    );
    expect(nestedTimeline.to).toHaveBeenCalledWith(
      ".card",
      expect.objectContaining({ opacity: 1, y: 0 }),
      "+=0.2",
    );
    expect(rootTimeline.add).toHaveBeenCalledWith(nestedTimeline, "main");
  });

  it("forwards fps and dependencies to useGSAP options", () => {
    render(
      <GSAPTimeline fps={60} dependencies={["external-dependency"]}>
        <GSAPFrom target=".title" vars={{ opacity: 0 }} />
      </GSAPTimeline>,
    );

    expect(capturedOptions?.fps).toBe(60);
    expect(capturedOptions?.dependencies).toBeDefined();
    expect(capturedOptions?.dependencies?.[0]).toBe("external-dependency");
    expect((capturedOptions?.dependencies ?? []).length).toBe(1);
  });
});
