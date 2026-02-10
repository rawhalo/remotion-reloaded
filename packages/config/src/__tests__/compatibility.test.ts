import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { checkCompatibility, detectVersion } from "../compatibility";
import { setErrorMode } from "../errorMode";

describe("checkCompatibility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    setErrorMode("silent");
  });

  afterEach(() => {
    process.env = originalEnv;
    setErrorMode("throw");
  });

  it("returns cssFilters and svgFilters as always true", () => {
    const result = checkCompatibility();
    expect(result.cssFilters).toBe(true);
    expect(result.svgFilters).toBe(true);
  });

  it("returns webgl=true in local environment", () => {
    process.env = { ...originalEnv };
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.K_SERVICE;
    const result = checkCompatibility();
    expect(result.webgl).toBe(true);
    expect(result.recommended).toBe("webgl");
  });

  it("returns webgl=false on Lambda", () => {
    process.env = { ...originalEnv, AWS_LAMBDA_FUNCTION_NAME: "fn" };
    const result = checkCompatibility();
    expect(result.webgl).toBe(false);
    expect(result.recommended).toBe("css");
  });

  it("returns webgl=true on cloud-run-gpu", () => {
    process.env = {
      ...originalEnv,
      K_SERVICE: "svc",
      NVIDIA_VISIBLE_DEVICES: "all",
    };
    const result = checkCompatibility();
    expect(result.webgl).toBe(true);
    expect(result.recommended).toBe("webgl");
  });

  it("returns webgpu as false (conservative default)", () => {
    const result = checkCompatibility();
    expect(result.webgpu).toBe(false);
  });

  it("warns when a required dep is missing", () => {
    const result = checkCompatibility({
      _resolveVersion: () => null, // all deps missing
    });
    const remotionWarning = result.warnings.find((w) =>
      w.includes("remotion not found"),
    );
    expect(remotionWarning).toBeDefined();
    expect(remotionWarning).toContain("required peer dependency");
  });

  it("does not warn for missing optional deps", () => {
    const result = checkCompatibility({
      _resolveVersion: () => null,
    });
    // Only remotion is required, so only 1 warning expected
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("remotion");
  });

  it("warns when a dep has wrong version (caret)", () => {
    const result = checkCompatibility({
      _resolveVersion: (name) => {
        if (name === "remotion") return "3.5.0"; // too old, ^4.0.0 required
        if (name === "gsap") return "3.14.2"; // OK
        return null;
      },
    });
    const remotionWarning = result.warnings.find((w) =>
      w.includes("remotion@3.5.0"),
    );
    expect(remotionWarning).toBeDefined();
    expect(remotionWarning).toContain("recommended ^4.0.0");
  });

  it("warns when a dep has wrong version (gte)", () => {
    const result = checkCompatibility({
      _resolveVersion: (name) => {
        if (name === "remotion") return "4.0.420"; // OK
        if (name === "three") return "0.150.0"; // too old, >=0.160.0
        return null;
      },
    });
    const threeWarning = result.warnings.find((w) =>
      w.includes("three@0.150.0"),
    );
    expect(threeWarning).toBeDefined();
    expect(threeWarning).toContain("recommended >=0.160.0");
  });

  it("does not warn when all versions are compatible", () => {
    const result = checkCompatibility({
      _resolveVersion: (name) => {
        if (name === "remotion") return "4.0.420";
        if (name === "gsap") return "3.14.2";
        if (name === "three") return "0.172.0";
        if (name === "@react-three/fiber") return "9.1.0";
        return null;
      },
    });
    expect(result.warnings).toHaveLength(0);
  });

  it("calls handleError in warn mode for each warning", () => {
    setErrorMode("warn");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = checkCompatibility({
      _resolveVersion: () => null, // triggers 1 warning (remotion required)
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[remotion-reloaded]"),
      undefined,
    );
    spy.mockRestore();
  });

  it("does not throw in silent mode even with warnings", () => {
    setErrorMode("silent");
    expect(() =>
      checkCompatibility({ _resolveVersion: () => null }),
    ).not.toThrow();
  });
});

describe("detectVersion", () => {
  it("returns null for unknown packages", () => {
    expect(detectVersion("@totally/nonexistent-package-xyz")).toBe(null);
  });

  it("returns a version string for installed packages", () => {
    // vitest is installed, so its version should be detectable
    const version = detectVersion("vitest");
    if (version) {
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    }
  });
});
