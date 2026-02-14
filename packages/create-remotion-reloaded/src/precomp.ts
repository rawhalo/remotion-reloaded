import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { defaultLogger, type Logger } from "./logger";

const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6m1P8AAAAASUVORK5CYII=";
const DEFAULT_RETENTION_DAYS = 7;
const DEFAULT_ENTRY_POINT = "src/index.ts";
const DEFAULT_VIDEO_CODEC = "h264" as const;

export interface PrecompCacheInput {
  compositionId: string;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  includeAlpha: boolean;
  colorSpace: string;
  pixelFormat: string;
  chromeMode: "default" | "headless-shell";
  chromiumOptionsGl: string;
  rendererResolved: "webgl" | "webgpu";
  inputPropsHash: string;
  effectGraphHash: string;
  packageVersions: {
    effects: string;
    three: string;
  };
}

export interface PrecompMetadata extends PrecompCacheInput {
  cacheKey: string;
  effectsCompositionId: string;
  entryPoint: string;
  outputFormat: "media" | "still";
  sourceCompositionId: string;
}

export type PrecompOutputFormat = "media" | "still";

export interface RunPrecompOptions {
  cacheInput: PrecompCacheInput;
  chromiumOptions?: {
    gl?: string;
  };
  concurrency?: number | null;
  cwd?: string;
  effectsCompositionId?: string;
  effectsInputProps?: Record<string, unknown>;
  entryPoint?: string;
  executeRender?: boolean;
  logger?: Logger;
  noCache?: boolean;
  outputFormat?: PrecompOutputFormat;
  resolveCompositionMetadata?: boolean;
  sourceCompositionId: string;
  sourceInputProps?: Record<string, unknown>;
  writePlaceholderFrame?: boolean;
}

export interface RunPrecompResult {
  cacheHit: boolean;
  cacheKey: string;
  effectsCompositionId: string;
  finalOutputPath: string;
  pass1Dir: string;
  pass1MetadataPath: string;
  pass1OutputPath: string;
  pass1ReferenceFramePath: string;
  finalDir: string;
  finalMetadataPath: string;
  metadata: PrecompMetadata;
  outputFormat: PrecompOutputFormat;
  sourceCompositionId: string;
}

export interface CleanPrecompOptions {
  cwd?: string;
  logger?: Logger;
  retentionDays?: number;
}

export interface CleanPrecompResult {
  deletedPaths: string[];
  scannedCacheDirectories: number;
}

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
    .sort((left, right) => left.localeCompare(right));

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
};

const hashString = (input: string): string => {
  let fnv = 0x811c9dc5;
  let djb = 5381;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    fnv ^= code;
    fnv = Math.imul(fnv, 0x01000193);
    djb = Math.imul(djb, 33) ^ code;
  }

  return `${(fnv >>> 0).toString(16).padStart(8, "0")}${(djb >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
};

const normalizeCacheInput = (input: PrecompCacheInput): PrecompCacheInput => {
  return {
    ...input,
    compositionId: input.compositionId.trim(),
    colorSpace: input.colorSpace.trim(),
    pixelFormat: input.pixelFormat.trim(),
    chromiumOptionsGl: input.chromiumOptionsGl.trim(),
    inputPropsHash: input.inputPropsHash.trim(),
    effectGraphHash: input.effectGraphHash.trim(),
    packageVersions: {
      effects: input.packageVersions.effects.trim(),
      three: input.packageVersions.three.trim(),
    },
  };
};

const readJsonIfExists = <T>(filePath: string): T | null => {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
};

const writeJson = (filePath: string, value: unknown): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
};

const metadataMatches = (
  current: PrecompMetadata | null,
  expected: PrecompMetadata,
): boolean => {
  if (!current) {
    return false;
  }

  return stableSerialize(current) === stableSerialize(expected);
};

const ensurePlaceholderFrame = (pass1Dir: string, enabled: boolean): void => {
  if (!enabled) {
    return;
  }

  const framePath = path.join(pass1Dir, "frames", "frame-000000.png");
  if (existsSync(framePath)) {
    return;
  }

  mkdirSync(path.dirname(framePath), { recursive: true });
  writeFileSync(framePath, Buffer.from(PLACEHOLDER_PNG_BASE64, "base64"));
};

const getPackageVersion = (
  cwd: string,
  packageName: string,
): string => {
  const packageJsonPath = path.join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    return "unknown";
  }

  const packageJson = readJsonIfExists<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  }>(packageJsonPath);

  if (!packageJson) {
    return "unknown";
  }

  return (
    packageJson.dependencies?.[packageName] ??
    packageJson.devDependencies?.[packageName] ??
    packageJson.peerDependencies?.[packageName] ??
    "unknown"
  );
};

export const createPrecompCacheKey = (input: PrecompCacheInput): string => {
  const normalized = normalizeCacheInput(input);
  return `pc_${hashString(stableSerialize(normalized))}`;
};

type RemotionComposition = {
  durationInFrames: number;
  fps: number;
  height: number;
  id: string;
  width: number;
};

interface RemotionModules {
  bundle: any;
  getCompositions: any;
  renderMedia: any;
  renderStill: any;
}

const loadRemotionModules = async (): Promise<RemotionModules> => {
  try {
    const [bundler, renderer] = await Promise.all([
      import("@remotion/bundler"),
      import("@remotion/renderer"),
    ]);

    return {
      bundle: bundler.bundle,
      getCompositions: renderer.getCompositions,
      renderMedia: renderer.renderMedia,
      renderStill: renderer.renderStill,
    };
  } catch (error) {
    throw new Error(
      `[remotion-reloaded] Unable to load Remotion renderer dependencies. Install "remotion", "@remotion/bundler", and "@remotion/renderer".${error instanceof Error ? `\n${error.message}` : ""}`,
    );
  }
};

const findComposition = (
  compositions: readonly RemotionComposition[],
  compositionId: string,
): RemotionComposition => {
  const composition = compositions.find((entry) => entry.id === compositionId);
  if (!composition) {
    const available = compositions.map((entry) => entry.id).join(", ");
    throw new Error(
      `[remotion-reloaded] Composition "${compositionId}" not found. Available compositions: ${available}`,
    );
  }
  return composition;
};

const ensurePass1ReferenceFrame = async (
  modules: RemotionModules,
  options: {
    chromiumOptions?: { gl?: string };
    composition: RemotionComposition;
    inputProps?: Record<string, unknown>;
    logger: Logger;
    pass1ReferenceFramePath: string;
    serveUrl: string;
  },
): Promise<void> => {
  mkdirSync(path.dirname(options.pass1ReferenceFramePath), { recursive: true });
  await modules.renderStill({
    chromiumOptions: options.chromiumOptions,
    composition: options.composition as unknown as object,
    frame: 0,
    imageFormat: "png",
    inputProps: options.inputProps,
    logLevel: "error",
    output: options.pass1ReferenceFramePath,
    serveUrl: options.serveUrl,
  });
  options.logger.log(
    `[remotion-reloaded] Rendered pass1 reference frame: ${options.pass1ReferenceFramePath}`,
  );
};

export const runPrecomp = async (
  options: RunPrecompOptions,
): Promise<RunPrecompResult> => {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? defaultLogger;
  const executeRender = options.executeRender ?? true;
  const outputFormat = options.outputFormat ?? "media";
  const noCache = Boolean(options.noCache);
  const resolveCompositionMetadata = options.resolveCompositionMetadata ?? false;
  const sourceCompositionId = options.sourceCompositionId;
  const effectsCompositionId = options.effectsCompositionId ?? sourceCompositionId;
  const normalizedInput = normalizeCacheInput({
    ...options.cacheInput,
    compositionId: sourceCompositionId,
  });
  const entryPoint = path.resolve(cwd, options.entryPoint ?? DEFAULT_ENTRY_POINT);
  const chromiumOptions = options.chromiumOptions ?? {
    gl: normalizedInput.chromiumOptionsGl,
  };

  const createLayout = (
    cacheInput: PrecompCacheInput,
  ): {
    cacheHit: boolean;
    cacheKey: string;
    metadata: PrecompMetadata;
    pass1Dir: string;
    pass1MetadataPath: string;
    pass1OutputPath: string;
    pass1ReferenceFramePath: string;
    finalDir: string;
    finalMetadataPath: string;
    finalOutputPath: string;
    shouldRenderPass1: boolean;
    shouldRenderFinal: boolean;
  } => {
    const cacheKey = createPrecompCacheKey(cacheInput);
    const pass1Dir = path.join(
      cwd,
      "public",
      "renders",
      "pass1",
      cacheInput.compositionId,
      cacheKey,
    );
    const finalDir = path.join(
      cwd,
      "public",
      "renders",
      "final",
      cacheInput.compositionId,
      cacheKey,
    );
    const pass1ReferenceFramePath = path.join(
      pass1Dir,
      "frames",
      "frame-000000.png",
    );
    const pass1OutputPath =
      outputFormat === "media"
        ? path.join(pass1Dir, "source.mp4")
        : pass1ReferenceFramePath;
    const finalOutputPath =
      outputFormat === "media"
        ? path.join(finalDir, "output.mp4")
        : path.join(finalDir, "output.png");
    const pass1MetadataPath = path.join(pass1Dir, "metadata.json");
    const finalMetadataPath = path.join(finalDir, "metadata.json");
    const metadata: PrecompMetadata = {
      ...cacheInput,
      cacheKey,
      effectsCompositionId,
      entryPoint,
      outputFormat,
      sourceCompositionId,
    };
    const currentMetadata = readJsonIfExists<PrecompMetadata>(pass1MetadataPath);
    const cacheHit = !noCache && metadataMatches(currentMetadata, metadata);
    const pass1OutputExists = existsSync(pass1OutputPath);
    const pass1FrameExists = existsSync(pass1ReferenceFramePath);
    const finalOutputExists = existsSync(finalOutputPath);

    return {
      cacheHit,
      cacheKey,
      metadata,
      pass1Dir,
      pass1MetadataPath,
      pass1OutputPath,
      pass1ReferenceFramePath,
      finalDir,
      finalMetadataPath,
      finalOutputPath,
      shouldRenderPass1:
        !cacheHit || !pass1OutputExists || (outputFormat === "media" && !pass1FrameExists),
      shouldRenderFinal: noCache || !finalOutputExists,
    };
  };

  if (!executeRender) {
    let dryRunInput = normalizedInput;
    if (resolveCompositionMetadata) {
      if (!existsSync(entryPoint)) {
        throw new Error(
          `[remotion-reloaded] Entry point not found: ${entryPoint}. Use --entry-point to specify a valid Remotion entry.`,
        );
      }

      const modules = await loadRemotionModules();
      const serveUrl = await modules.bundle({
        entryPoint,
        onProgress: () => undefined,
      });
      const sourceCompositions = await modules.getCompositions(serveUrl, {
        chromiumOptions,
        inputProps: options.sourceInputProps,
        logLevel: "error",
      });
      const sourceComposition = findComposition(
        sourceCompositions,
        sourceCompositionId,
      );
      dryRunInput = normalizeCacheInput({
        ...normalizedInput,
        compositionId: sourceComposition.id,
        durationInFrames: sourceComposition.durationInFrames,
        fps: sourceComposition.fps,
        height: sourceComposition.height,
        width: sourceComposition.width,
      });
    }

    const layout = createLayout(dryRunInput);
    writeJson(layout.pass1MetadataPath, layout.metadata);
    ensurePlaceholderFrame(layout.pass1Dir, options.writePlaceholderFrame ?? true);
    writeJson(layout.finalMetadataPath, layout.metadata);
    logger.log(
      `[remotion-reloaded] Pre-comp dry-run complete at ${path.relative(
        cwd,
        layout.pass1Dir,
      )}.`,
    );

    return {
      cacheHit: layout.cacheHit,
      cacheKey: layout.cacheKey,
      effectsCompositionId,
      finalOutputPath: layout.finalOutputPath,
      pass1Dir: layout.pass1Dir,
      pass1MetadataPath: layout.pass1MetadataPath,
      pass1OutputPath: layout.pass1OutputPath,
      pass1ReferenceFramePath: layout.pass1ReferenceFramePath,
      finalDir: layout.finalDir,
      finalMetadataPath: layout.finalMetadataPath,
      metadata: layout.metadata,
      outputFormat,
      sourceCompositionId,
    };
  }

  if (!existsSync(entryPoint)) {
    throw new Error(
      `[remotion-reloaded] Entry point not found: ${entryPoint}. Use --entry-point to specify a valid Remotion entry.`,
    );
  }

  const modules = await loadRemotionModules();
  const serveUrl = await modules.bundle({
    entryPoint,
    onProgress: () => undefined,
  });
  const sourceCompositions = await modules.getCompositions(serveUrl, {
    chromiumOptions,
    inputProps: options.sourceInputProps,
    logLevel: "error",
  });
  const sourceComposition = findComposition(
    sourceCompositions,
    sourceCompositionId,
  );
  const effectsCompositions =
    effectsCompositionId === sourceCompositionId
      ? sourceCompositions
      : await modules.getCompositions(serveUrl, {
          chromiumOptions,
          inputProps: options.effectsInputProps,
          logLevel: "error",
        });
  const effectsComposition = findComposition(
    effectsCompositions,
    effectsCompositionId,
  );
  const resolvedInput = normalizeCacheInput({
    ...normalizedInput,
    compositionId: sourceComposition.id,
    durationInFrames: sourceComposition.durationInFrames,
    fps: sourceComposition.fps,
    height: sourceComposition.height,
    width: sourceComposition.width,
  });
  const layout = createLayout(resolvedInput);

  mkdirSync(layout.pass1Dir, { recursive: true });
  mkdirSync(layout.finalDir, { recursive: true });

  if (layout.shouldRenderPass1) {
    if (outputFormat === "media") {
      await modules.renderMedia({
        codec: DEFAULT_VIDEO_CODEC,
        composition: sourceComposition as unknown as object,
        concurrency:
          typeof options.concurrency === "number" && Number.isFinite(options.concurrency)
            ? options.concurrency
            : undefined,
        chromiumOptions,
        inputProps: options.sourceInputProps,
        logLevel: "error",
        outputLocation: layout.pass1OutputPath,
        serveUrl,
      });
      logger.log(
        `[remotion-reloaded] Rendered pass1 media artifact: ${layout.pass1OutputPath}`,
      );
    }

    await ensurePass1ReferenceFrame(modules, {
      chromiumOptions,
      composition: sourceComposition,
      inputProps: options.sourceInputProps,
      logger,
      pass1ReferenceFramePath: layout.pass1ReferenceFramePath,
      serveUrl,
    });
  } else {
    logger.log(
      `[remotion-reloaded] Reusing cached pass1 artifact: ${layout.pass1OutputPath}`,
    );
  }

  const effectsInputProps = {
    ...(options.effectsInputProps ?? {}),
    pass1ArtifactDir: layout.pass1Dir,
    pass1FrameDir: path.join(layout.pass1Dir, "frames"),
    pass1MediaPath: layout.pass1OutputPath,
    pass1MetadataPath: layout.pass1MetadataPath,
  };

  if (layout.shouldRenderFinal) {
    if (outputFormat === "media") {
      await modules.renderMedia({
        codec: DEFAULT_VIDEO_CODEC,
        composition: effectsComposition as unknown as object,
        concurrency:
          typeof options.concurrency === "number" && Number.isFinite(options.concurrency)
            ? options.concurrency
            : undefined,
        chromiumOptions,
        inputProps: effectsInputProps,
        logLevel: "error",
        outputLocation: layout.finalOutputPath,
        serveUrl,
      });
    } else {
      await modules.renderStill({
        chromiumOptions,
        composition: effectsComposition as unknown as object,
        frame: 0,
        imageFormat: "png",
        inputProps: effectsInputProps,
        logLevel: "error",
        output: layout.finalOutputPath,
        serveUrl,
      });
    }
    logger.log(
      `[remotion-reloaded] Rendered final pass2 output: ${layout.finalOutputPath}`,
    );
  } else {
    logger.log(
      `[remotion-reloaded] Reusing cached final output: ${layout.finalOutputPath}`,
    );
  }

  writeJson(layout.pass1MetadataPath, layout.metadata);
  writeJson(layout.finalMetadataPath, layout.metadata);

  return {
    cacheHit: layout.cacheHit,
    cacheKey: layout.cacheKey,
    effectsCompositionId,
    finalOutputPath: layout.finalOutputPath,
    pass1Dir: layout.pass1Dir,
    pass1MetadataPath: layout.pass1MetadataPath,
    pass1OutputPath: layout.pass1OutputPath,
    pass1ReferenceFramePath: layout.pass1ReferenceFramePath,
    finalDir: layout.finalDir,
    finalMetadataPath: layout.finalMetadataPath,
    metadata: layout.metadata,
    outputFormat,
    sourceCompositionId,
  };
};

export const cleanPrecompCache = (
  options: CleanPrecompOptions = {},
): CleanPrecompResult => {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? defaultLogger;
  const retentionDays = options.retentionDays ?? DEFAULT_RETENTION_DAYS;
  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const pass1Root = path.join(cwd, "public", "renders", "pass1");

  if (!existsSync(pass1Root)) {
    return {
      deletedPaths: [],
      scannedCacheDirectories: 0,
    };
  }

  const deletedPaths: string[] = [];
  let scannedCacheDirectories = 0;

  for (const compositionEntry of readdirSync(pass1Root, { withFileTypes: true })) {
    if (!compositionEntry.isDirectory()) {
      continue;
    }

    const compositionDir = path.join(pass1Root, compositionEntry.name);
    for (const cacheEntry of readdirSync(compositionDir, { withFileTypes: true })) {
      if (!cacheEntry.isDirectory()) {
        continue;
      }

      const cacheDir = path.join(compositionDir, cacheEntry.name);
      scannedCacheDirectories += 1;
      const stats = statSync(cacheDir);

      if (stats.mtimeMs < cutoffMs) {
        rmSync(cacheDir, { recursive: true, force: true });
        deletedPaths.push(cacheDir);
      }
    }
  }

  if (deletedPaths.length > 0) {
    logger.log(
      `[remotion-reloaded] Removed ${deletedPaths.length} stale pre-comp cache director${deletedPaths.length === 1 ? "y" : "ies"}.`,
    );
  }

  return {
    deletedPaths,
    scannedCacheDirectories,
  };
};

export const buildDefaultPrecompCacheInput = (
  cwd: string,
  overrides: Partial<PrecompCacheInput> & { compositionId: string },
): PrecompCacheInput => {
  return {
    compositionId: overrides.compositionId,
    fps: overrides.fps ?? 30,
    durationInFrames: overrides.durationInFrames ?? 300,
    width: overrides.width ?? 1920,
    height: overrides.height ?? 1080,
    includeAlpha: overrides.includeAlpha ?? false,
    colorSpace: overrides.colorSpace ?? "bt709",
    pixelFormat: overrides.pixelFormat ?? "yuv420p",
    chromeMode: overrides.chromeMode ?? "headless-shell",
    chromiumOptionsGl: overrides.chromiumOptionsGl ?? "angle",
    rendererResolved: overrides.rendererResolved ?? "webgl",
    inputPropsHash: overrides.inputPropsHash ?? "props_unknown",
    effectGraphHash: overrides.effectGraphHash ?? "effects_unknown",
    packageVersions: overrides.packageVersions ?? {
      effects: getPackageVersion(cwd, "@remotion-reloaded/effects"),
      three: getPackageVersion(cwd, "@remotion-reloaded/three"),
    },
  };
};
