import { describe, it, expect, afterEach } from "vitest";
import { useRenderMode } from "../renderMode";

describe("useRenderMode", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns isPreview=true in local environment", () => {
    process.env = { ...originalEnv };
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.K_SERVICE;
    const mode = useRenderMode();
    expect(mode.isPreview).toBe(true);
    expect(mode.isRender).toBe(false);
    expect(mode.isLambda).toBe(false);
    expect(mode.hasGPU).toBe(true);
  });

  it("returns isLambda=true on Lambda", () => {
    process.env = { ...originalEnv, AWS_LAMBDA_FUNCTION_NAME: "render-fn" };
    const mode = useRenderMode();
    expect(mode.isPreview).toBe(false);
    expect(mode.isRender).toBe(true);
    expect(mode.isLambda).toBe(true);
    expect(mode.hasGPU).toBe(false);
  });

  it("returns hasGPU=false on cloud-run without GPU", () => {
    process.env = { ...originalEnv, K_SERVICE: "svc" };
    delete process.env.NVIDIA_VISIBLE_DEVICES;
    const mode = useRenderMode();
    expect(mode.isPreview).toBe(false);
    expect(mode.isRender).toBe(true);
    expect(mode.hasGPU).toBe(false);
  });

  it("returns hasGPU=true on cloud-run with GPU", () => {
    process.env = {
      ...originalEnv,
      K_SERVICE: "svc",
      NVIDIA_VISIBLE_DEVICES: "all",
    };
    const mode = useRenderMode();
    expect(mode.isPreview).toBe(false);
    expect(mode.isRender).toBe(true);
    expect(mode.hasGPU).toBe(true);
  });
});
