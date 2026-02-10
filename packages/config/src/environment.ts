export type RenderEnvironment =
  | "local"
  | "lambda"
  | "cloud-run"
  | "cloud-run-gpu"
  | "unknown";

/**
 * Detect the current render environment.
 */
export function getRenderEnvironment(): RenderEnvironment {
  // TODO: Task 1.2 — full implementation
  if (typeof process === "undefined") return "unknown";
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return "lambda";
  if (process.env.K_SERVICE && process.env.NVIDIA_VISIBLE_DEVICES)
    return "cloud-run-gpu";
  if (process.env.K_SERVICE) return "cloud-run";
  return "local";
}
