import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("duotone effect", () => {
  it("renders SVG color matrix mapping dark/light tones", () => {
    const html = renderToStaticMarkup(
      <Effect type="duotone" dark="#112233" light="#ffeeaa">
        <span>Duo</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="duotone"');
    expect(html).toContain("filter:url(#rr-duotone-");
    expect(html).toContain("<feColorMatrix");
    expect(html).toContain("type=\"matrix\"");
  });
});
