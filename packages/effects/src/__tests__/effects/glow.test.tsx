import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("glow effect", () => {
  it("renders drop-shadow filters", () => {
    const html = renderToStaticMarkup(
      <Effect type="glow" radius={24} color="#ff00ff">
        <span>Glow</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="glow"');
    expect(html).toContain("drop-shadow");
    expect(html).toContain("#ff00ff");
  });
});
