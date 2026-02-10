export type ErrorMode = "throw" | "warn" | "silent";

let currentMode: ErrorMode = "throw";

/**
 * Set the error handling mode for Remotion Reloaded.
 * - "throw": throw errors (default, recommended for development)
 * - "warn": log warnings to console
 * - "silent": suppress errors silently
 */
export function setErrorMode(mode: ErrorMode): void {
  currentMode = mode;
}

/**
 * Get the current error handling mode.
 */
export function getErrorMode(): ErrorMode {
  return currentMode;
}

/**
 * Handle an error according to the current error mode.
 */
export function handleError(message: string, error?: unknown): void {
  switch (currentMode) {
    case "throw":
      throw error instanceof Error ? error : new Error(message);
    case "warn":
      console.warn(`[remotion-reloaded] ${message}`, error);
      break;
    case "silent":
      break;
  }
}
