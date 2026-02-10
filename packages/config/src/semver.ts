/**
 * Parse a semver version string into its components.
 * Returns null if the string cannot be parsed.
 */
export function parseVersion(v: string): { major: number; minor: number; patch: number } | null {
  const match = v.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Check if a version satisfies a simple semver range.
 * Supports ^x.y.z (compatible) and >=x.y.z (minimum) patterns.
 *
 * Returns true if the range format is unrecognized (fail-open).
 */
export function satisfiesRange(version: string, range: string): boolean {
  const actual = parseVersion(version);
  const rangePrefix = range.startsWith(">=") ? ">=" : range.startsWith("^") ? "^" : null;
  const rangeVersion = parseVersion(range.replace(/^[\^>=]+/, ""));

  if (!actual || !rangeVersion || !rangePrefix) return true; // can't check, assume OK

  if (rangePrefix === ">=") {
    if (actual.major > rangeVersion.major) return true;
    if (actual.major < rangeVersion.major) return false;
    if (actual.minor > rangeVersion.minor) return true;
    if (actual.minor < rangeVersion.minor) return false;
    return actual.patch >= rangeVersion.patch;
  }

  // ^ means compatible (same major, >= minor.patch)
  if (actual.major !== rangeVersion.major) return false;
  if (actual.minor > rangeVersion.minor) return true;
  if (actual.minor < rangeVersion.minor) return false;
  return actual.patch >= rangeVersion.patch;
}
