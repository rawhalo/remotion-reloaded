import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

const effectComposerSpy = vi.fn();
const bloomSpy = vi.fn();
const depthOfFieldSpy = vi.fn();
const chromaticAberrationSpy = vi.fn();
const vignetteSpy = vi.fn();
const noiseSpy = vi.fn();

vi.mock("@react-three/postprocessing", () => ({
  EffectComposer: (props: unknown) => {
    effectComposerSpy(props);
    const typed = props as { children?: React.ReactNode };
    return React.createElement("mock-effect-composer", null, typed.children);
  },
  Bloom: (props: unknown) => {
    bloomSpy(props);
    return React.createElement("mock-bloom", null);
  },
  DepthOfField: (props: unknown) => {
    depthOfFieldSpy(props);
    return React.createElement("mock-depth-of-field", null);
  },
  ChromaticAberration: (props: unknown) => {
    chromaticAberrationSpy(props);
    return React.createElement("mock-chromatic-aberration", null);
  },
  Vignette: (props: unknown) => {
    vignetteSpy(props);
    return React.createElement("mock-vignette", null);
  },
  Noise: (props: unknown) => {
    noiseSpy(props);
    return React.createElement("mock-noise", null);
  },
}));

const {
  EffectComposer,
  Bloom,
  DepthOfField,
  ChromaticAberration,
  Vignette,
  Noise,
} = await import("../effects");

describe("three postprocessing wrappers", () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    effectComposerSpy.mockReset();
    bloomSpy.mockReset();
    depthOfFieldSpy.mockReset();
    chromaticAberrationSpy.mockReset();
    vignetteSpy.mockReset();
    noiseSpy.mockReset();
  });

  afterEach(() => {
    renderer?.unmount();
    renderer = null;
    vi.restoreAllMocks();
  });

  it("composes effects through EffectComposer", async () => {
    await act(async () => {
      renderer = create(
        <EffectComposer multisampling={8} autoClear={false}>
          <Bloom intensity={0.7} luminanceThreshold={0.2} />
          <Noise opacity={0.03} />
        </EffectComposer>,
      );
    });

    expect(effectComposerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        multisampling: 8,
        autoClear: false,
      }),
    );

    const props = effectComposerSpy.mock.calls[0][0] as {
      children?: React.ReactNode;
    };

    expect(React.Children.count(props.children)).toBe(2);
    expect(bloomSpy).toHaveBeenCalledWith(
      expect.objectContaining({ intensity: 0.7, luminanceThreshold: 0.2 }),
    );
    expect(noiseSpy).toHaveBeenCalledWith(
      expect.objectContaining({ opacity: 0.03 }),
    );
  });

  it("passes props through all effect wrappers", async () => {
    await act(async () => {
      renderer = create(
        <EffectComposer>
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.08}
            bokehScale={2.5}
          />
          <ChromaticAberration offset={[0.002, 0.001]} />
          <Vignette darkness={0.6} offset={0.4} />
        </EffectComposer>,
      );
    });

    expect(depthOfFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        focusDistance: 0.02,
        focalLength: 0.08,
        bokehScale: 2.5,
      }),
    );

    expect(chromaticAberrationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: [0.002, 0.001],
      }),
    );

    expect(vignetteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        darkness: 0.6,
        offset: 0.4,
      }),
    );
  });
});
