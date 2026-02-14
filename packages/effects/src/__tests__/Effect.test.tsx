import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../components/Effect";
import { EffectStack } from "../components/EffectStack";

describe("Effect", () => {
  it("wraps children and applies CSS filter output", () => {
    const html = renderToStaticMarkup(
      <Effect type="blur" radius={10}>
        <span>Hello</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="blur"');
    expect(html).toContain("filter:blur(10.00px)");
    expect(html).toContain("<span>Hello</span>");
  });

  it("renders SVG filter definitions for SVG-backed effects", () => {
    const html = renderToStaticMarkup(
      <Effect type="noise" amount={0.2} seed={99}>
        <span>Noise</span>
      </Effect>,
    );

    expect(html).toContain("<svg");
    expect(html).toContain("feTurbulence");
    expect(html).toContain("seed=\"99\"");
    expect(html).toContain("filter:url(#rr-noise-");
  });

  it("throws unknown effect with available effects list", () => {
    expect(() =>
      renderToStaticMarkup(
        <Effect type={"does-not-exist"}>
          <span>Unknown</span>
        </Effect>,
      ),
    ).toThrowError(/available effects/i);
  });

  it("updates visual output when parameter props change", () => {
    const first = renderToStaticMarkup(
      <Effect type="blur" radius={2}>
        <span>Animated</span>
      </Effect>,
    );
    const second = renderToStaticMarkup(
      <Effect type="blur" radius={24}>
        <span>Animated</span>
      </Effect>,
    );

    expect(first).toContain("blur(2.00px)");
    expect(second).toContain("blur(24.00px)");
    expect(first).not.toEqual(second);
  });

  it("uses full-size wrapper defaults for standalone overlay effects", () => {
    const html = renderToStaticMarkup(
      <Effect type="vignette" darkness={0.4}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          Centered
        </div>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="vignette"');
    expect(html).toContain("width:100%");
    expect(html).toContain("height:100%");
    expect(html).toContain("Centered");
  });

  it("does not force full-size wrapper for non-overlay effects", () => {
    const html = renderToStaticMarkup(
      <Effect type="blur" radius={4}>
        <span>Inline</span>
      </Effect>,
    );

    expect(html).not.toContain("width:100%");
    expect(html).not.toContain("height:100%");
  });
});

describe("EffectStack", () => {
  it("applies effects in declaration order", () => {
    const html = renderToStaticMarkup(
      <EffectStack>
        <Effect type="sepia" amount={1} />
        <Effect type="blur" radius={6} />
        <span>Layered</span>
      </EffectStack>,
    );

    const blurIndex = html.indexOf('data-effect-type="blur"');
    const sepiaIndex = html.indexOf('data-effect-type="sepia"');

    expect(blurIndex).toBeGreaterThanOrEqual(0);
    expect(sepiaIndex).toBeGreaterThanOrEqual(0);
    expect(blurIndex).toBeLessThan(sepiaIndex);
    expect(html).toContain("<span>Layered</span>");
  });

  it("ensures stack layers are full-size to preserve absolute positioning", () => {
    const html = renderToStaticMarkup(
      <EffectStack>
        <Effect type="vignette" darkness={0.4} />
        <Effect type="film" grain={0.1} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          Centered
        </div>
      </EffectStack>,
    );

    const widthMatches = html.match(/width:100%/g) ?? [];
    const heightMatches = html.match(/height:100%/g) ?? [];

    expect(widthMatches.length).toBeGreaterThanOrEqual(2);
    expect(heightMatches.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("Centered");
  });
});
