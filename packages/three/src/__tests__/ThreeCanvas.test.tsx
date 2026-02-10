import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { resolveRenderer } from "../canvas/rendererDetection";
import { resolveThreeQualityPreset } from "../canvas/qualityPresets";

let mockFrame = 0;
let mockIsRendering = false;
let mockWebGpuApiAvailable = false;
let mockWebGpuSupported = false;

const remotionThreeSpy = vi.fn();

vi.mock("remotion", () => ({
  useCurrentFrame: () => mockFrame,
  useRemotionEnvironment: () => ({ isRendering: mockIsRendering }),
}));

vi.mock("@remotion/three", () => ({
  ThreeCanvas: (props: unknown) => {
    remotionThreeSpy(props);
    return React.createElement("mock-three-canvas", null);
  },
}));

vi.mock("../canvas/rendererDetection", async () => {
  const actual = await vi.importActual<typeof import("../canvas/rendererDetection")>(
    "../canvas/rendererDetection",
  );

  return {
    ...actual,
    hasWebGpuApi: vi.fn(() => mockWebGpuApiAvailable),
    detectWebGpuSupport: vi.fn(async () => mockWebGpuSupported),
  };
});

const { ThreeCanvas } = await import("../canvas/ThreeCanvas");
const { detectWebGpuSupport } = await import("../canvas/rendererDetection");

const getRenderedProps = (): Record<string, unknown> => {
  const lastCall = remotionThreeSpy.mock.calls.at(-1);
  if (!lastCall) {
    throw new Error("Expected @remotion/three ThreeCanvas to be called.");
  }

  return lastCall[0] as Record<string, unknown>;
};

const renderCanvas = (props?: Partial<React.ComponentProps<typeof ThreeCanvas>>) =>
  create(
    <ThreeCanvas width={1920} height={1080} {...props}>
      <group />
    </ThreeCanvas>,
  );

describe("ThreeCanvas", () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    mockFrame = 0;
    mockIsRendering = false;
    mockWebGpuApiAvailable = false;
    mockWebGpuSupported = false;
    remotionThreeSpy.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    renderer?.unmount();
    renderer = null;
    vi.restoreAllMocks();
  });

  it("forces frameloop='never' and defaults to WebGL", async () => {
    await act(async () => {
      renderer = renderCanvas();
    });

    const props = getRenderedProps();
    expect(props.frameloop).toBe("never");
    expect(props.gl).toMatchObject({
      antialias: true,
      powerPreference: "high-performance",
    });
  });

  it("manually advances frame in preview mode", async () => {
    const advance = vi.fn();

    await act(async () => {
      renderer = renderCanvas();
    });

    const props = getRenderedProps();
    (props.onCreated as ((state: unknown) => void) | undefined)?.({ advance });

    mockFrame = 1;
    await act(async () => {
      renderer?.update(
        <ThreeCanvas width={1920} height={1080}>
          <group />
        </ThreeCanvas>,
      );
    });

    mockFrame = 2;
    await act(async () => {
      renderer?.update(
        <ThreeCanvas width={1920} height={1080}>
          <group />
        </ThreeCanvas>,
      );
    });

    expect(advance).toHaveBeenCalledTimes(2);
  });

  it("does not manually advance while rendering", async () => {
    const advance = vi.fn();
    mockIsRendering = true;

    await act(async () => {
      renderer = renderCanvas();
    });

    const props = getRenderedProps();
    (props.onCreated as ((state: unknown) => void) | undefined)?.({ advance });

    mockFrame = 1;
    await act(async () => {
      renderer?.update(
        <ThreeCanvas width={1920} height={1080}>
          <group />
        </ThreeCanvas>,
      );
    });

    expect(advance).not.toHaveBeenCalled();
  });

  it("falls back to WebGL when WebGPU is requested but unavailable", async () => {
    const onRendererResolved = vi.fn();

    mockWebGpuApiAvailable = false;
    mockWebGpuSupported = false;

    await act(async () => {
      renderer = renderCanvas({
        renderer: "webgpu",
        onRendererResolved,
      });
    });

    const props = getRenderedProps();
    expect(props.gl).toMatchObject({
      antialias: true,
    });
    expect(detectWebGpuSupport).toHaveBeenCalled();
    expect(onRendererResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        requested: "webgpu",
        resolved: "webgl",
      }),
    );
  });

  it("uses WebGPU gl factory when available", async () => {
    const onRendererResolved = vi.fn();

    mockWebGpuApiAvailable = true;
    mockWebGpuSupported = true;

    await act(async () => {
      renderer = renderCanvas({
        renderer: "webgpu",
        onRendererResolved,
      });
    });

    const props = getRenderedProps();
    expect(typeof props.gl).toBe("function");
    expect(onRendererResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        requested: "webgpu",
        resolved: "webgpu",
      }),
    );
  });
});

describe("renderer/quality helpers", () => {
  it("resolves webgpu request to webgl fallback when unsupported", () => {
    expect(resolveRenderer("webgpu", false)).toEqual({
      requested: "webgpu",
      resolved: "webgl",
      reason: "webgpu-unavailable",
    });
  });

  it("auto quality maps to lambda preset in lambda environments", () => {
    const { preset } = resolveThreeQualityPreset({
      quality: "auto",
      environment: "lambda",
    });

    expect(preset.name).toBe("lambda");
    expect(preset.shadows).toBe(false);
    expect(preset.dpr).toBe(0.5);
    expect(preset.gl.antialias).toBe(false);
  });
});
