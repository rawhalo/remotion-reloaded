import { getRenderEnvironment } from "./environment";
import { handleError } from "./errorMode";
import { satisfiesRange } from "./semver";

export interface CompatibilityResult {
  /** WebGL likely available */
  webgl: boolean;
  /** WebGPU likely available */
  webgpu: boolean;
  /** CSS filters available (always true in Chromium) */
  cssFilters: boolean;
  /** SVG filters available (always true in Chromium) */
  svgFilters: boolean;
  /** Recommended rendering pipeline */
  recommended: "webgpu" | "webgl" | "css";
  /** Peer dependency warnings (empty if all OK) */
  warnings: string[];
}

interface PeerDepCheck {
  name: string;
  recommended: string;
  required: boolean;
}

/** @internal */
export const PEER_DEPS: PeerDepCheck[] = [
  { name: "remotion", recommended: "^4.0.0", required: true },
  { name: "gsap", recommended: "^3.12.0", required: false },
  { name: "three", recommended: ">=0.160.0", required: false },
  { name: "@react-three/fiber", recommended: "^9.0.0", required: false },
];

/**
 * Try to detect installed version of a package.
 * Returns null if not detected.
 * @internal Exported for testing only.
 */
export function detectVersion(packageName: string): string | null {
  try {
    const resolved = require(`${packageName}/package.json`);
    return resolved?.version ?? null;
  } catch {
    return null;
  }
}

export interface CheckCompatibilityOptions {
  /** @internal Override version resolver for testing */
  _resolveVersion?: (name: string) => string | null;
}

/**
 * Check rendering capabilities and peer dependency compatibility.
 *
 * Logs warnings for any version mismatches according to the current error mode.
 *
 * @example
 * ```ts
 * import { checkCompatibility } from '@remotion-reloaded/config';
 *
 * const result = checkCompatibility();
 * if (result.warnings.length > 0) {
 *   console.log('Compatibility issues:', result.warnings);
 * }
 * ```
 */
export function checkCompatibility(
  options?: CheckCompatibilityOptions,
): CompatibilityResult {
  const resolve = options?._resolveVersion ?? detectVersion;
  const env = getRenderEnvironment();
  const hasGPU = env === "local" || env === "cloud-run-gpu";
  const warnings: string[] = [];

  // Check peer dependencies
  for (const dep of PEER_DEPS) {
    const version = resolve(dep.name);
    if (!version) {
      if (dep.required) {
        warnings.push(
          `${dep.name} not found. This is a required peer dependency (${dep.recommended}).`,
        );
      }
      continue;
    }
    if (!satisfiesRange(version, dep.recommended)) {
      warnings.push(
        `${dep.name}@${version} detected, recommended ${dep.recommended}. Some features may not work correctly.`,
      );
    }
  }

  // Report warnings via error mode
  for (const warning of warnings) {
    handleError(warning);
  }

  return {
    webgl: hasGPU,
    webgpu: false, // conservative — runtime probing needed for true detection
    cssFilters: true,
    svgFilters: true,
    recommended: hasGPU ? "webgl" : "css",
    warnings,
  };
}
