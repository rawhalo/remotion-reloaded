import { getRenderEnvironment } from "./environment";

export interface CompatibilityResult {
  webgl: boolean;
  webgpu: boolean;
  cssFilters: boolean;
  svgFilters: boolean;
  recommended: "webgpu" | "webgl" | "css";
}

/**
 * Check GPU and rendering capabilities of the current environment.
 */
export function checkCompatibility(): CompatibilityResult {
  // TODO: Task 1.2 — full implementation with runtime probing
  const env = getRenderEnvironment();
  const hasGPU = env === "local" || env === "cloud-run-gpu";

  return {
    webgl: hasGPU,
    webgpu: false, // conservative default until probed
    cssFilters: true,
    svgFilters: true,
    recommended: hasGPU ? "webgl" : "css",
  };
}
