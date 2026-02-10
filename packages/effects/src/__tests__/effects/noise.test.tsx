import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";
import { resolveEffectPlan } from "../../engine/registry";

describe("noise effect", () => {
  it("renders SVG turbulence and seed parameter", () => {
    const html = renderToStaticMarkup(
      <Effect type="noise" amount={0.3} baseFrequency={0.6} octaves={4} seed={123}>
        <span>Noise</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="noise"');
    expect(html).toContain("<feTurbulence");
    expect(html).toContain('seed="123"');
    expect(html).toContain('baseFrequency="0.6"');
  });

  it("is deterministic for identical seed input", () => {
    const first = resolveEffectPlan("noise", {
      amount: 0.3,
      baseFrequency: 0.6,
      octaves: 4,
      seed: 123,
    });
    const second = resolveEffectPlan("noise", {
      amount: 0.3,
      baseFrequency: 0.6,
      octaves: 4,
      seed: 123,
    });
    const third = resolveEffectPlan("noise", {
      amount: 0.3,
      baseFrequency: 0.6,
      octaves: 4,
      seed: 124,
    });

    expect(first).toEqual(second);
    expect(third).not.toEqual(first);
  });
});
