import { describe, it, expect, beforeEach, vi } from "vitest";
import { setErrorMode, getErrorMode, handleError } from "../errorMode";

describe("errorMode", () => {
  beforeEach(() => {
    setErrorMode("throw"); // reset to default
  });

  it("defaults to throw mode", () => {
    expect(getErrorMode()).toBe("throw");
  });

  it("throws in throw mode", () => {
    expect(() => handleError("test error")).toThrow("test error");
  });

  it("warns in warn mode", () => {
    setErrorMode("warn");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    handleError("test warning");
    expect(spy).toHaveBeenCalledWith(
      "[remotion-reloaded] test warning",
      undefined,
    );
    spy.mockRestore();
  });

  it("is silent in silent mode", () => {
    setErrorMode("silent");
    expect(() => handleError("should not throw")).not.toThrow();
  });
});
