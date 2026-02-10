import { describe, it, expect, vi, afterEach } from "vitest";
import { getRenderEnvironment } from "../environment";

describe("getRenderEnvironment", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 'local' by default", () => {
    process.env = { ...originalEnv };
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.K_SERVICE;
    expect(getRenderEnvironment()).toBe("local");
  });

  it("detects lambda", () => {
    process.env = { ...originalEnv, AWS_LAMBDA_FUNCTION_NAME: "my-func" };
    expect(getRenderEnvironment()).toBe("lambda");
  });

  it("detects cloud-run", () => {
    process.env = { ...originalEnv, K_SERVICE: "my-service" };
    delete process.env.NVIDIA_VISIBLE_DEVICES;
    expect(getRenderEnvironment()).toBe("cloud-run");
  });

  it("detects cloud-run-gpu", () => {
    process.env = {
      ...originalEnv,
      K_SERVICE: "my-service",
      NVIDIA_VISIBLE_DEVICES: "all",
    };
    expect(getRenderEnvironment()).toBe("cloud-run-gpu");
  });
});
