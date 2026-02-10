import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Effect,
  EffectPreset,
  GSAPTimeline,
  useGSAP,
} from "../index";
import { withReloaded } from "../config";

describe("remotion-reloaded meta exports", () => {
  it("exports GSAP helpers from the root package", () => {
    expect(typeof useGSAP).toBe("function");
    expect(typeof GSAPTimeline).toBe("function");
  });

  it("exports Effect from the root package and can render", () => {
    const html = renderToStaticMarkup(
      <Effect type="blur" radius={6}>
        <span>Hello</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="blur"');
    expect(html).toContain("blur(6.00px)");
  });

  it("exports EffectPreset from the root package and can render", () => {
    const html = renderToStaticMarkup(
      <EffectPreset name="dream">
        <span>Hello</span>
      </EffectPreset>,
    );

    expect(html).toContain('data-effect-type="glow"');
    expect(html).toContain('data-effect-type="blur"');
  });

  it("exports config helpers through the config subpath", () => {
    expect(typeof withReloaded).toBe("function");
  });
});
