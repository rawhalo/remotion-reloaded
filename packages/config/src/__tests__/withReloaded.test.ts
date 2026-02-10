import { describe, it, expect } from "vitest";
import { withReloaded } from "../withReloaded";

describe("withReloaded", () => {
  it("returns angle GL renderer by default", () => {
    const config = withReloaded();
    expect(config.chromiumOptions.gl).toBe("angle");
  });

  it("returns empty browserArgs by default", () => {
    const config = withReloaded();
    expect(config.browserArgs).toEqual([]);
  });

  it("allows overriding GL renderer", () => {
    const config = withReloaded({ gl: "egl" });
    expect(config.chromiumOptions.gl).toBe("egl");
  });

  it("adds WebGPU flags when webgpu is true", () => {
    const config = withReloaded({ webgpu: true });
    expect(config.browserArgs).toContain("--enable-unsafe-webgpu");
    expect(config.browserArgs).toContain("--enable-features=Vulkan");
  });

  it("does not add WebGPU flags when webgpu is false", () => {
    const config = withReloaded({ webgpu: false });
    expect(config.browserArgs).not.toContain("--enable-unsafe-webgpu");
  });

  it("enables WebGPU via cloudRun.enableWebGPU", () => {
    const config = withReloaded({ cloudRun: { enableWebGPU: true } });
    expect(config.browserArgs).toContain("--enable-unsafe-webgpu");
  });

  it("passes through custom chromium flags", () => {
    const config = withReloaded({
      chromiumFlags: ["--disable-gpu-sandbox", "--no-sandbox"],
    });
    expect(config.browserArgs).toContain("--disable-gpu-sandbox");
    expect(config.browserArgs).toContain("--no-sandbox");
  });

  it("combines WebGPU flags with custom flags", () => {
    const config = withReloaded({
      webgpu: true,
      chromiumFlags: ["--no-sandbox"],
    });
    expect(config.browserArgs).toContain("--enable-unsafe-webgpu");
    expect(config.browserArgs).toContain("--no-sandbox");
    expect(config.browserArgs).toHaveLength(3); // webgpu + vulkan + no-sandbox
  });

  it("works with no arguments", () => {
    const config = withReloaded();
    expect(config).toHaveProperty("chromiumOptions");
    expect(config).toHaveProperty("browserArgs");
  });

  it("accepts cloudRun.gpuType without error", () => {
    const config = withReloaded({ cloudRun: { gpuType: "T4" } });
    expect(config.chromiumOptions.gl).toBe("angle");
  });
});
