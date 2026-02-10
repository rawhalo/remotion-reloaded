import { getRenderEnvironment } from "./environment";

export interface RenderMode {
  isPreview: boolean;
  isRender: boolean;
  isLambda: boolean;
  hasGPU: boolean;
}

/**
 * React hook returning current render mode information.
 * Must be called inside a Remotion component.
 */
export function useRenderMode(): RenderMode {
  // TODO: Task 1.2 — full implementation with useCurrentFrame detection
  const env = getRenderEnvironment();
  return {
    isPreview: env === "local",
    isRender: env !== "local",
    isLambda: env === "lambda",
    hasGPU: env === "local" || env === "cloud-run-gpu",
  };
}
