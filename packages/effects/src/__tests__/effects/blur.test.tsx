import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../../components/Effect";

describe("blur effect", () => {
  it("renders blur css filter", () => {
    const html = renderToStaticMarkup(
      <Effect type="blur" radius={12}>
        <span>Blur</span>
      </Effect>,
    );

    expect(html).toContain('data-effect-type="blur"');
    expect(html).toContain("filter:blur(12.00px)");
  });
});
