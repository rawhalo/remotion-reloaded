import { getRenderEnvironment } from "./environment";

export interface RenderMode {
  /** True when running in Remotion Studio preview (local dev) */
  isPreview: boolean;
  /** True when running a production render (any environment) */
  isRender: boolean;
  /** True when running on AWS Lambda */
  isLambda: boolean;
  /** True when GPU is likely available (local or cloud-run-gpu) */
  hasGPU: boolean;
}

/**
 * Returns current render mode information based on environment detection.
 *
 * Use this to conditionally adjust quality, particle counts, or effect
 * pipelines based on the rendering context.
 *
 * @example
 * ```tsx
 * import { useRenderMode } from '@remotion-reloaded/config';
 *
 * export const MyComp = () => {
 *   const { hasGPU, isLambda } = useRenderMode();
 *   const particles = hasGPU ? 50000 : 500;
 *   return <GPUParticles count={particles} />;
 * };
 * ```
 */
export function useRenderMode(): RenderMode {
  const env = getRenderEnvironment();
  return {
    isPreview: env === "local",
    isRender: env !== "local" && env !== "unknown",
    isLambda: env === "lambda",
    hasGPU: env === "local" || env === "cloud-run-gpu",
  };
}
