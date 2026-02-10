import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../components/Effect";
import { getAvailableEffectTypes, resolveEffectPlan } from "../engine/registry";
import { supportsWebGl } from "../engine/webglPipeline";

const ADVANCED_EFFECTS = [
  "glitch",
  "wave",
  "bulge",
  "ripple",
  "pixelate",
  "motionBlur",
  "radialBlur",
  "tiltShift",
  "vhs",
  "halftone",
  "neon",
  "godRays",
  "lensFlare",
] as const;

describe("webgl advanced effects", () => {
  const originalLambdaVar = process.env.AWS_LAMBDA_FUNCTION_NAME;

  afterEach(() => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = originalLambdaVar;
  });

  it("registers all advanced effects as built-ins", () => {
    const available = getAvailableEffectTypes();

    for (const effectType of ADVANCED_EFFECTS) {
      expect(available).toContain(effectType);
    }
  });

  it("builds WebGL plans with raw GLSL shader source", () => {
    const glitchPlan = resolveEffectPlan("glitch", { strength: 0.8 });
    const ripplePlan = resolveEffectPlan("ripple", { speed: 1.5 });

    expect(glitchPlan.webglFilter?.shader).toContain("precision highp float");
    expect(glitchPlan.webglFilter?.shader).toContain("u_texture");
    expect(glitchPlan.webglFilter?.uniforms).toMatchObject({
      u_intensity: 1,
      u_strength: 0.8,
    });

    expect(ripplePlan.webglFilter?.kind).toBe("ripple");
    expect(ripplePlan.webglFilter?.uniforms).toMatchObject({
      u_speed: 1.5,
    });
  });

  it("skips non-CSS-equivalent WebGL effects on Lambda", () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = "rr-effects-test";

    const html = renderToStaticMarkup(
      <Effect type="glitch">
        <span>Lambda glitch</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="glitch"');
    expect(html).toContain('data-webgl-mode="skip"');
    expect(html).not.toContain("<canvas");
  });

  it("keeps CSS fallback path for WebGL neon on Lambda", () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = "rr-effects-test";

    const html = renderToStaticMarkup(
      <Effect type="neon" color="#00ffcc" radius={18}>
        <span>Lambda neon</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="neon"');
    expect(html).toContain('data-webgl-mode="source"');
    expect(html).toContain("<canvas");
  });

  it("reports no WebGL support in non-browser test runtime", () => {
    expect(supportsWebGl()).toBe(false);
  });
});
