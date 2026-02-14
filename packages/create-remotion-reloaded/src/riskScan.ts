import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EffectBackend } from "./renderRiskClassifier";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const EFFECT_TYPE_REGEX = /<Effect\b[^>]*\btype\s*=\s*["']([^"']+)["']/g;
const THREE_CANVAS_REGEX = /<ThreeCanvas\b|\bThreeCanvas\s*\(/;

const CSS_EFFECTS = new Set([
  "blackAndWhite",
  "blur",
  "contrast",
  "glow",
  "hueSaturation",
  "invert",
  "sepia",
  "vignette",
]);

const SVG_EFFECTS = new Set([
  "chromaticAberration",
  "displacement",
  "duotone",
  "noise",
]);

const COMPOSITE_EFFECTS = new Set(["film"]);

const WEBGL_EFFECTS = new Set([
  "bulge",
  "glitch",
  "godRays",
  "halftone",
  "lensFlare",
  "motionBlur",
  "neon",
  "pixelate",
  "radialBlur",
  "ripple",
  "tiltShift",
  "vhs",
  "wave",
]);

const hashString = (input: string): string => {
  let state = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    state ^= input.charCodeAt(index);
    state = Math.imul(state, 0x01000193);
  }

  return (state >>> 0).toString(16).padStart(8, "0");
};

const stableSerialize = (value: unknown): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort((a, b) => a.localeCompare(b));

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
};

const walkSourceFiles = (directory: string, entries: string[]): void => {
  if (!existsSync(directory)) {
    return;
  }

  const directoryEntries = readdirSync(directory, { withFileTypes: true });
  for (const entry of directoryEntries) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      walkSourceFiles(absolute, entries);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      entries.push(absolute);
    }
  }
};

const sortUnique = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

const resolveEffectBackend = (effectType: string): EffectBackend => {
  if (CSS_EFFECTS.has(effectType)) {
    return "css";
  }

  if (SVG_EFFECTS.has(effectType)) {
    return "svg";
  }

  if (WEBGL_EFFECTS.has(effectType)) {
    return "webgl";
  }

  if (COMPOSITE_EFFECTS.has(effectType)) {
    return "composite";
  }

  return "unknown";
};

export interface ProjectRiskScan {
  containsThreeCanvas: boolean;
  effectTypes: string[];
  effectBackends: EffectBackend[];
  effectGraphHash: string;
  sourceFilesScanned: number;
}

const extractEffectTypes = (source: string): string[] => {
  const detected: string[] = [];

  for (const match of source.matchAll(EFFECT_TYPE_REGEX)) {
    const effectType = match[1]?.trim();
    if (effectType) {
      detected.push(effectType);
    }
  }

  return detected;
};

export const scanProjectRisk = (
  cwd: string,
  sourceRoot = "src",
): ProjectRiskScan => {
  const sourceDirectory = path.join(cwd, sourceRoot);
  const files: string[] = [];
  walkSourceFiles(sourceDirectory, files);

  let containsThreeCanvas = false;
  const effectTypes: string[] = [];

  for (const filePath of files) {
    const source = readFileSync(filePath, "utf-8");

    if (!containsThreeCanvas && THREE_CANVAS_REGEX.test(source)) {
      containsThreeCanvas = true;
    }

    effectTypes.push(...extractEffectTypes(source));
  }

  const normalizedTypes = sortUnique(
    effectTypes.map((effectType) => effectType.toLowerCase()),
  );
  const effectBackends = sortUnique(
    normalizedTypes.map((effectType) => resolveEffectBackend(effectType)),
  ) as EffectBackend[];

  const effectGraphHash = `eg_${hashString(
    stableSerialize({
      containsThreeCanvas,
      effectTypes: normalizedTypes,
      effectBackends,
    }),
  )}`;

  return {
    containsThreeCanvas,
    effectTypes: normalizedTypes,
    effectBackends,
    effectGraphHash,
    sourceFilesScanned: files.length,
  };
};
