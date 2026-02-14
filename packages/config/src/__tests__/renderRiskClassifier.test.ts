import { describe, expect, it } from "vitest";
import {
  classifyRenderRisk,
  normalizeClassifierInput,
  type ClassifierInput,
} from "../renderRiskClassifier";

const baseInput: ClassifierInput = {
  compositionId: "DemoComposition",
  renderMode: "render",
  chromeMode: "headless-shell",
  requestedRenderer: "auto",
  containsThreeCanvas: true,
  effectTypes: ["glitch"],
  effectBackends: ["webgl"],
  environment: "local",
  chromiumOptionsGl: "angle",
  concurrency: 0,
  colorSpace: "bt709",
};

describe("normalizeClassifierInput", () => {
  it("normalizes and sorts unstable fields deterministically", () => {
    const normalized = normalizeClassifierInput({
      ...baseInput,
      effectTypes: ["Glitch", "pixelate", "glitch", "  pixelate "],
      effectBackends: ["webgl", "css", "webgl"],
      compositionId: " DemoComposition ",
      chromiumOptionsGl: " angle ",
    });

    expect(normalized.effectTypes).toEqual(["glitch", "pixelate"]);
    expect(normalized.effectBackends).toEqual(["css", "webgl"]);
    expect(normalized.compositionId).toBe("DemoComposition");
    expect(normalized.chromiumOptionsGl).toBe("angle");
  });
});

describe("classifyRenderRisk", () => {
  it("marks ThreeCanvas + WebGL effects in render mode as requires-precomp", () => {
    const result = classifyRenderRisk(baseInput);

    expect(result.decision).toBe("requires-precomp");
    expect(result.reasons.map((reason) => reason.code)).toContain(
      "RISK_THREE_WEBGL_EFFECT_RENDER_MODE",
    );
    expect(result.reasons.map((reason) => reason.code)).toContain(
      "RISK_THREE_WEBGL_EFFECT_HEADLESS_SHELL",
    );
  });

  it("returns single-pass-safe when no risky combo exists", () => {
    const result = classifyRenderRisk({
      ...baseInput,
      containsThreeCanvas: false,
      effectTypes: ["glow", "vignette"],
      effectBackends: ["css"],
    });

    expect(result.decision).toBe("single-pass-safe");
    expect(result.reasons).toEqual([
      expect.objectContaining({
        code: "SAFE_NO_RISKY_COMBINATION",
        severity: "info",
      }),
    ]);
  });

  it("produces the same fingerprint for semantically identical inputs", () => {
    const resultA = classifyRenderRisk({
      ...baseInput,
      effectTypes: ["pixelate", "glitch"],
      effectBackends: ["webgl", "css"],
    });
    const resultB = classifyRenderRisk({
      ...baseInput,
      effectTypes: ["glitch", "pixelate", "glitch"],
      effectBackends: ["css", "webgl"],
    });

    expect(resultA.fingerprint).toBe(resultB.fingerprint);
    expect(resultA.normalizedInput).toEqual(resultB.normalizedInput);
  });

  it("adds lambda-specific risk reason for risky combos", () => {
    const result = classifyRenderRisk({
      ...baseInput,
      environment: "lambda",
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.reasons.map((reason) => reason.code)).toContain(
      "RISK_THREE_WEBGL_EFFECT_LAMBDA",
    );
  });
});
