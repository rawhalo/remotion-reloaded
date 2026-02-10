export type RenderEnvironment =
  | "local"
  | "lambda"
  | "cloud-run"
  | "cloud-run-gpu"
  | "unknown";

/**
 * Detect the current render environment based on environment variables.
 *
 * - `"lambda"` — AWS Lambda (detected via `AWS_LAMBDA_FUNCTION_NAME`)
 * - `"cloud-run-gpu"` — Google Cloud Run with GPU (detected via `K_SERVICE` + `NVIDIA_VISIBLE_DEVICES`)
 * - `"cloud-run"` — Google Cloud Run without GPU (detected via `K_SERVICE`)
 * - `"local"` — Local development or self-hosted render
 * - `"unknown"` — Cannot determine (e.g. browser environment without process)
 */
export function getRenderEnvironment(): RenderEnvironment {
  if (typeof process === "undefined") return "unknown";
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return "lambda";
  if (process.env.K_SERVICE && process.env.NVIDIA_VISIBLE_DEVICES)
    return "cloud-run-gpu";
  if (process.env.K_SERVICE) return "cloud-run";
  return "local";
}
