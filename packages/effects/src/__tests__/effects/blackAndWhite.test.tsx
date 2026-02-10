import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("blackAndWhite effect", () => {
  it("renders grayscale css filter", () => {
    const html = renderToStaticMarkup(
      <Effect type="blackAndWhite" amount={0.8}>
        <span>Mono</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="blackAndWhite"');
    expect(html).toContain("filter:grayscale(0.8000)");
  });
});
