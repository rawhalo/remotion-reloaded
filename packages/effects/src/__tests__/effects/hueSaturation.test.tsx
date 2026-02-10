import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("hueSaturation effect", () => {
  it("renders hue, saturation, and brightness css filters", () => {
    const html = renderToStaticMarkup(
      <Effect type="hueSaturation" hue={45} saturation={0.2} lightness={-0.1}>
        <span>Grade</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="hueSaturation"');
    expect(html).toContain("hue-rotate(45.00deg)");
    expect(html).toContain("saturate(1.2000)");
    expect(html).toContain("brightness(0.9000)");
  });
});
