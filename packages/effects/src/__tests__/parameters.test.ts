import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Effect } from "../components/Effect";

describe("effect parameter validation", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("clamps out-of-range numeric props and warns", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Effect,
        { type: "blur", radius: -10 },
        React.createElement("span", null, "clamp"),
      ),
    );

    expect(html).toContain("blur(0.00px)");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Effect "blur" prop "radius" value -10 is invalid'),
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Clamped to 0"));
  });

  it("falls back for invalid types and warns", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Effect,
        { type: "noise", amount: "bad-input", seed: 12 },
        React.createElement("span", null, "noise"),
      ),
    );

    expect(html).toContain("feTurbulence");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Effect "noise" prop "amount" expected number'),
    );
  });

  it("clamps intensity into the 0..1 range", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Effect,
        { type: "sepia", amount: 1, intensity: 2 },
        React.createElement("span", null, "sepia"),
      ),
    );

    expect(html).toContain("sepia(1.0000)");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Effect "sepia" prop "intensity" value 2 is invalid'),
    );
  });
});
