import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("chromaticAberration effect", () => {
  it("renders SVG RGB channel split filter", () => {
    const html = renderToStaticMarkup(
      <Effect type="chromaticAberration" offset={3} angle={0}>
        <span>Chromatic</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="chromaticAberration"');
    expect(html).toContain("filter:url(#rr-chromaticAberration-");
    expect(html).toContain("<feOffset");
    expect(html).toContain("dx=\"3\"");
  });
});
