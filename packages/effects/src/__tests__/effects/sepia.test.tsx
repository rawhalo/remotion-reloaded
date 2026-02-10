import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("sepia effect", () => {
  it("renders sepia css filter", () => {
    const html = renderToStaticMarkup(
      <Effect type="sepia" amount={0.4}>
        <span>Sepia</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="sepia"');
    expect(html).toContain("filter:sepia(0.4000)");
  });
});
