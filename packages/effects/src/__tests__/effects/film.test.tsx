import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";
import { resolveEffectPlan } from "../../engine/registry";

describe("film effect", () => {
  it("renders combined sepia, vignette, and grain", () => {
    const html = renderToStaticMarkup(
      <Effect type="film" grain={0.2} sepia={0.3} vignette={0.5} seed={77}>
        <span>Film</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="film"');
    expect(html).toContain("sepia(0.3000)");
    expect(html).toContain("radial-gradient(");
    expect(html).toContain("<feTurbulence");
    expect(html).toContain('seed="77"');
  });

  it("is deterministic for identical seed input", () => {
    const first = resolveEffectPlan("film", {
      grain: 0.2,
      sepia: 0.3,
      vignette: 0.5,
      seed: 77,
    });
    const second = resolveEffectPlan("film", {
      grain: 0.2,
      sepia: 0.3,
      vignette: 0.5,
      seed: 77,
    });
    const third = resolveEffectPlan("film", {
      grain: 0.2,
      sepia: 0.3,
      vignette: 0.5,
      seed: 78,
    });

    expect(first).toEqual(second);
    expect(third).not.toEqual(first);
  });
});
