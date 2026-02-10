/**
 * Options for configuring Remotion with Remotion Reloaded.
 */
export interface WithReloadedOptions {
  /** Enable WebGPU support (adds --enable-unsafe-webgpu flag). Default: false */
  webgpu?: boolean;
  /** Chromium GL renderer. Default: "angle" (required for WebGL in headless) */
  gl?: "angle" | "egl" | "vulkan";
  /** Additional Chromium flags to pass */
  chromiumFlags?: string[];
  /** Cloud Run configuration */
  cloudRun?: {
    gpuType?: "T4" | "L4" | "A100";
    enableWebGPU?: boolean;
  };
}

/**
 * Return value from withReloaded(), compatible with Remotion's config.
 */
export interface ReloadedConfig {
  chromiumOptions: {
    gl: "angle" | "egl" | "vulkan";
  };
  browserArgs: string[];
}

/**
 * Configure Remotion for use with Remotion Reloaded.
 *
 * Sets `gl:"angle"` for WebGL support in headless Chrome and optionally
 * enables WebGPU via Chromium flags.
 *
 * @example
 * ```ts
 * // remotion.config.ts
 * import { withReloaded } from 'remotion-reloaded/config';
 * export default withReloaded();
 * ```
 *
 * @example
 * ```ts
 * // With WebGPU enabled
 * export default withReloaded({ webgpu: true });
 * ```
 */
export function withReloaded(options: WithReloadedOptions = {}): ReloadedConfig {
  const enableWebGPU = options.webgpu || options.cloudRun?.enableWebGPU || false;

  const browserArgs: string[] = [];
  if (enableWebGPU) {
    browserArgs.push("--enable-unsafe-webgpu");
    browserArgs.push("--enable-features=Vulkan");
  }
  if (options.chromiumFlags) {
    browserArgs.push(...options.chromiumFlags);
  }

  return {
    chromiumOptions: {
      gl: options.gl ?? "angle",
    },
    browserArgs,
  };
}
