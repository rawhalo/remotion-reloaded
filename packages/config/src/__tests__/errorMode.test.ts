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

  it("re-throws Error instances in throw mode", () => {
    const original = new TypeError("type issue");
    expect(() => handleError("wrapped", original)).toThrow(original);
  });

  it("creates new Error from message when error is not an Error instance", () => {
    expect(() => handleError("string error", "not an Error")).toThrow("string error");
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

  it("warns with error object in warn mode", () => {
    setErrorMode("warn");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = new Error("details");
    handleError("test warning", err);
    expect(spy).toHaveBeenCalledWith(
      "[remotion-reloaded] test warning",
      err,
    );
    spy.mockRestore();
  });

  it("is silent in silent mode", () => {
    setErrorMode("silent");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => handleError("should not throw")).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("can switch between modes", () => {
    expect(getErrorMode()).toBe("throw");
    setErrorMode("warn");
    expect(getErrorMode()).toBe("warn");
    setErrorMode("silent");
    expect(getErrorMode()).toBe("silent");
    setErrorMode("throw");
    expect(getErrorMode()).toBe("throw");
  });
});
