import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("vignette effect", () => {
  it("renders radial-gradient overlay", () => {
    const html = renderToStaticMarkup(
      <Effect type="vignette" darkness={0.7} offset={0.25}>
        <span>Vignette</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="vignette"');
    expect(html).toContain("radial-gradient(");
    expect(html).toContain("rgba(0,0,0,0.700)");
  });
});
