/**
 * Configure Remotion for use with Remotion Reloaded.
 * Sets gl:"angle" for WebGL support and other required settings.
 */
export function withReloaded(options: WithReloadedOptions = {}) {
  // TODO: Task 1.2 — full implementation
  return {
    chromiumOptions: {
      gl: "angle" as const,
      ...options.chromiumOptions,
    },
  };
}

export interface WithReloadedOptions {
  chromiumOptions?: {
    gl?: "angle" | "swiftshader" | "vulkan" | "egl";
  };
}
