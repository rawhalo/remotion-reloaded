import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EffectPreset, type PresetName } from "../components/EffectPreset";

describe("EffectPreset", () => {
  it("cinematic applies film, vignette, and subtle color grade", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="cinematic">
        <span>Cinematic</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="film"');
    expect(html).toContain('data-effect-type="vignette"');
    expect(html).toContain('data-effect-type="hueSaturation"');
  });

  it("vintage applies sepia, vignette, and noise", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="vintage">
        <span>Vintage</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="sepia"');
    expect(html).toContain('data-effect-type="vignette"');
    expect(html).toContain('data-effect-type="noise"');
  });

  it("dream applies glow, desaturation, blur, and vignette", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="dream">
        <span>Dream</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="glow"');
    expect(html).toContain('data-effect-type="hueSaturation"');
    expect(html).toContain('data-effect-type="blur"');
    expect(html).toContain('data-effect-type="vignette"');
  });

  it("retro-vhs applies scan lines, chromatic aberration, noise, and tracking", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="retro-vhs">
        <span>Retro VHS</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="vhs"');
    expect(html).toContain('data-effect-type="chromaticAberration"');
    expect(html).toContain('data-effect-type="noise"');
    expect(html).toContain('data-effect-type="glitch"');
  });

  it("cyberpunk applies neon glow, glitch, and high contrast", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="cyberpunk">
        <span>Cyberpunk</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="neon"');
    expect(html).toContain('data-effect-type="glitch"');
    expect(html).toContain('data-effect-type="contrast"');
  });

  it("scales all preset layers with global intensity", () => {
    const full = renderToStaticMarkup(
      <EffectPreset name="dream" intensity={1}>
        <span>Dream</span>
      </EffectPreset>,
    );
    const half = renderToStaticMarkup(
      <EffectPreset name="dream" intensity={0.5}>
        <span>Dream</span>
      </EffectPreset>,
    );

    expect(full).toContain("blur(1.95px)");
    expect(half).toContain("blur(0.98px)");
  });

  it("throws on unknown preset names at runtime", () => {
    expect(() =>
      renderToStaticMarkup(
        <EffectPreset name={"unknown" as PresetName}>
          <span>Unknown</span>
        </EffectPreset>,
      ),
    ).toThrowError(/available presets/i);
  });
});
