import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  createParticleSeedStates,
  sampleParticlePosition,
  type ParticleBehaviorType,
} from "../particles/behaviors";

let mockFrame = 0;
let mockFps = 30;

vi.mock("remotion", () => ({
  useCurrentFrame: () => mockFrame,
  useVideoConfig: () => ({ fps: mockFps }),
}));

const {
  GPUParticles,
  MAX_PARTICLE_COUNT,
  PARTICLE_SHADER_SOURCES,
  resolveParticleEngine,
} = await import("../particles/GPUParticles");

describe("GPUParticles", () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    mockFrame = 0;
    mockFps = 30;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    renderer?.unmount();
    renderer = null;
    vi.restoreAllMocks();
  });

  it("clamps particle count at 100,000 and warns", async () => {
    await act(async () => {
      renderer = create(<GPUParticles count={5_000_000} />);
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(`Clamped to ${MAX_PARTICLE_COUNT} particles`),
    );
  });

  it("uses fallback count and behavior on Lambda", async () => {
    const onEngineResolved = vi.fn();

    await act(async () => {
      renderer = create(
        <GPUParticles
          behavior="flow-field"
          count={10_000}
          fallbackBehavior="simple"
          fallbackCount={321}
          environment="lambda"
          onEngineResolved={onEngineResolved}
        />,
      );
    });

    expect(onEngineResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: "cpu",
        count: 321,
        effectiveBehavior: "simple",
      }),
    );
  });

  it("resolves webgpu request to webgl fallback when API is unavailable", () => {
    const resolution = resolveParticleEngine({
      count: 1200,
      renderer: "webgpu",
      environment: "local",
      webGpuApiAvailable: false,
    });

    expect(resolution.strategy).toBe("webgl-vertex");
    expect(resolution.resolvedRenderer).toBe("webgl");
  });

  it("bundles shader assets as raw strings", () => {
    expect(PARTICLE_SHADER_SOURCES.computeWgsl).toContain("@compute");
    expect(PARTICLE_SHADER_SOURCES.vertexGlsl).toContain("gl_PointSize");
    expect(PARTICLE_SHADER_SOURCES.fragmentGlsl).toContain("gl_PointCoord");
  });
});

describe("particle behavior determinism", () => {
  it("produces deterministic particle states for identical seed", () => {
    const first = createParticleSeedStates({
      count: 8,
      behavior: "flow-field",
      seed: 77,
    });

    const second = createParticleSeedStates({
      count: 8,
      behavior: "flow-field",
      seed: 77,
    });

    const third = createParticleSeedStates({
      count: 8,
      behavior: "flow-field",
      seed: 78,
    });

    expect(first).toEqual(second);
    expect(first).not.toEqual(third);
  });

  it("produces distinct sampled motion across all four behaviors", () => {
    const behaviors: ParticleBehaviorType[] = [
      "flow-field",
      "explosion",
      "orbit",
      "attract",
    ];

    const sampled = behaviors.map((behavior) => {
      const state = createParticleSeedStates({
        count: 1,
        behavior,
        seed: 42,
      })[0];

      const position = sampleParticlePosition({
        behavior,
        state,
        seconds: 1.25,
        index: 0,
        count: 1,
      });

      return position.map((value) => value.toFixed(4)).join(",");
    });

    expect(new Set(sampled).size).toBe(4);
  });
});
