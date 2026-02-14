import path from "node:path";
import {
  createProject,
  detectPackageManager,
  type CreateProjectResult,
} from "./create";
import { runDoctor } from "./doctor";
import { initProject } from "./init";
import { defaultLogger, type Logger } from "./logger";
import {
  buildDefaultPrecompCacheInput,
  cleanPrecompCache,
  runPrecomp,
  type PrecompOutputFormat,
  type PrecompCacheInput,
} from "./precomp";
import { runRenderPolicy } from "./render";
import {
  classifyRenderRisk,
  getRenderEnvironment,
  type ClassifierChromeMode,
  type ClassifierRenderer,
} from "./renderRiskClassifier";
import { scanProjectRisk } from "./riskScan";

const CLI_VERSION = "0.0.1";

interface ParsedCreateArgs {
  projectName: string;
  template: string;
  skipInstall: boolean;
}

interface ParsedRenderArgs {
  allowUnsafeSinglePass: boolean;
  chromeMode: ClassifierChromeMode;
  compositionId?: string;
  dryRun: boolean;
  effectsCompositionId?: string;
  entryPoint?: string;
  fallbackOnTimeout: boolean;
  maxDelayRenderMs: number | undefined;
  noCache: boolean;
  outputFormat: PrecompOutputFormat;
  resolveCompositionMetadata: boolean;
  requestedRenderer: ClassifierRenderer;
}

interface ParsedPrecompArgs {
  compositionId?: string;
  dryRun: boolean;
  effectsCompositionId?: string;
  entryPoint?: string;
  mode: "run" | "clean";
  noCache: boolean;
  outputFormat: PrecompOutputFormat;
  resolveCompositionMetadata: boolean;
  retentionDays?: number;
  sourceCompositionId?: string;
  overrides: Partial<PrecompCacheInput>;
  writePlaceholderFrame: boolean;
}

export interface RunCliOptions {
  cwd?: string;
  invokedAs?: string;
  logger?: Logger;
}

const printHelp = (logger: Logger, invokedAs: string): void => {
  const isRemotionCommand = invokedAs === "remotion-reloaded";

  if (isRemotionCommand) {
    logger.log(`remotion-reloaded ${CLI_VERSION}

Usage:
  remotion-reloaded init
  remotion-reloaded doctor
  remotion-reloaded render [options]
  remotion-reloaded precomp [options]
  remotion-reloaded precomp clean [options]
  remotion-reloaded create <project-name> [options]

Options:
  --composition-id <id>   Composition identifier for render/precomp commands
  --source-composition-id <id>
                          Source composition for pass1 in pre-comp mode
  --effects-composition-id <id>
                          Effects composition for pass2 in pre-comp mode
  --entry-point <path>    Remotion entry point (default: src/index.ts)
  --output-format <media|still>
                          Render media output or single-frame still output
  --dry-run               Do not execute renders; only compute routing/artifacts
  --resolve-composition-metadata
                          In dry-run mode, resolve source composition geometry for cache metadata
  --allow-unsafe-single-pass
                          Attempt unsafe single-pass and fall back on timeout
  --no-fallback-on-timeout
                          Fail fast instead of routing to pre-comp after timeout
  --max-delay-render-ms <ms>
                          Timeout guard for unsafe single-pass (default: 120000)
  --no-cache              Bypass pre-comp cache read/write
  --retention-days <n>    precomp clean retention window in days (default: 7)
  --template <name>   Scaffold template (default: default)
  --skip-install      Skip dependency installation
  -h, --help          Show help
  -v, --version       Show version
`);
    return;
  }

  logger.log(`create-remotion-reloaded ${CLI_VERSION}

Usage:
  create-remotion-reloaded <project-name> [options]
  create-remotion-reloaded init
  create-remotion-reloaded doctor
  create-remotion-reloaded render [options]
  create-remotion-reloaded precomp [options]
  create-remotion-reloaded precomp clean [options]

Options:
  --composition-id <id>   Composition identifier for render/precomp commands
  --source-composition-id <id>
                          Source composition for pass1 in pre-comp mode
  --effects-composition-id <id>
                          Effects composition for pass2 in pre-comp mode
  --entry-point <path>    Remotion entry point (default: src/index.ts)
  --output-format <media|still>
                          Render media output or single-frame still output
  --dry-run               Do not execute renders; only compute routing/artifacts
  --resolve-composition-metadata
                          In dry-run mode, resolve source composition geometry for cache metadata
  --allow-unsafe-single-pass
                          Attempt unsafe single-pass and fall back on timeout
  --no-fallback-on-timeout
                          Fail fast instead of routing to pre-comp after timeout
  --max-delay-render-ms <ms>
                          Timeout guard for unsafe single-pass (default: 120000)
  --no-cache              Bypass pre-comp cache read/write
  --retention-days <n>    precomp clean retention window in days (default: 7)
  --template <name>   Scaffold template (default: default)
  --skip-install      Skip dependency installation
  -h, --help          Show help
  -v, --version       Show version
`);
};

const parseCreateArgs = (args: readonly string[]): ParsedCreateArgs => {
  let projectName = "";
  let template = "default";
  let skipInstall = false;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--template") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --template.");
      }

      template = value;
      index += 1;
      continue;
    }

    if (token === "--skip-install") {
      skipInstall = true;
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }

    if (!projectName) {
      projectName = token;
      continue;
    }

    throw new Error(`Unexpected argument: ${token}`);
  }

  if (!projectName) {
    throw new Error("Project name is required.");
  }

  return {
    projectName,
    template,
    skipInstall,
  };
};

const parseNumberOption = (
  token: string,
  value: string | undefined,
): number => {
  if (!value) {
    throw new Error(`Missing value for ${token}.`);
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid numeric value for ${token}: ${value}`);
  }

  return numeric;
};

const parseRenderArgs = (args: readonly string[]): ParsedRenderArgs => {
  let allowUnsafeSinglePass = false;
  let chromeMode: ClassifierChromeMode = "headless-shell";
  let compositionId: string | undefined;
  let dryRun = false;
  let effectsCompositionId: string | undefined;
  let entryPoint: string | undefined;
  let fallbackOnTimeout = true;
  let maxDelayRenderMs: number | undefined;
  let noCache = false;
  let outputFormat: PrecompOutputFormat = "media";
  let resolveCompositionMetadata = false;
  let requestedRenderer: ClassifierRenderer = "auto";

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--composition-id") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --composition-id.");
      }
      compositionId = value;
      index += 1;
      continue;
    }

    if (token === "--chrome-mode") {
      const value = args[index + 1];
      if (value !== "headless-shell" && value !== "default") {
        throw new Error(`Invalid --chrome-mode value: ${value}`);
      }
      chromeMode = value;
      index += 1;
      continue;
    }

    if (token === "--renderer") {
      const value = args[index + 1];
      if (value !== "auto" && value !== "webgl" && value !== "webgpu") {
        throw new Error(`Invalid --renderer value: ${value}`);
      }
      requestedRenderer = value;
      index += 1;
      continue;
    }

    if (token === "--effects-composition-id") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --effects-composition-id.");
      }
      effectsCompositionId = value;
      index += 1;
      continue;
    }

    if (token === "--entry-point") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --entry-point.");
      }
      entryPoint = value;
      index += 1;
      continue;
    }

    if (token === "--output-format") {
      const value = args[index + 1];
      if (value !== "media" && value !== "still") {
        throw new Error(`Invalid --output-format value: ${value}`);
      }
      outputFormat = value;
      index += 1;
      continue;
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (token === "--resolve-composition-metadata") {
      resolveCompositionMetadata = true;
      continue;
    }

    if (token === "--allow-unsafe-single-pass") {
      allowUnsafeSinglePass = true;
      continue;
    }

    if (token === "--max-delay-render-ms") {
      maxDelayRenderMs = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--fallback-on-timeout") {
      fallbackOnTimeout = true;
      continue;
    }

    if (token === "--no-fallback-on-timeout") {
      fallbackOnTimeout = false;
      continue;
    }

    if (token === "--no-cache") {
      noCache = true;
      continue;
    }

    throw new Error(`Unknown option: ${token}`);
  }

  return {
    allowUnsafeSinglePass,
    chromeMode,
    compositionId,
    dryRun,
    effectsCompositionId,
    entryPoint,
    fallbackOnTimeout,
    maxDelayRenderMs,
    noCache,
    outputFormat,
    resolveCompositionMetadata,
    requestedRenderer,
  };
};

const parsePrecompArgs = (args: readonly string[]): ParsedPrecompArgs => {
  let compositionId: string | undefined;
  let dryRun = false;
  let effectsCompositionId: string | undefined;
  let entryPoint: string | undefined;
  let mode: "run" | "clean" = "run";
  let noCache = false;
  let outputFormat: PrecompOutputFormat = "media";
  let resolveCompositionMetadata = false;
  let writePlaceholderFrame = true;
  let retentionDays: number | undefined;
  let sourceCompositionId: string | undefined;
  const overrides: Partial<PrecompCacheInput> = {};

  let index = 0;
  if (args[0] === "clean") {
    mode = "clean";
    index = 1;
  }

  for (; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--composition-id") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --composition-id.");
      }
      compositionId = value;
      index += 1;
      continue;
    }

    if (token === "--source-composition-id") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --source-composition-id.");
      }
      sourceCompositionId = value;
      index += 1;
      continue;
    }

    if (token === "--effects-composition-id") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --effects-composition-id.");
      }
      effectsCompositionId = value;
      index += 1;
      continue;
    }

    if (token === "--entry-point") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --entry-point.");
      }
      entryPoint = value;
      index += 1;
      continue;
    }

    if (token === "--output-format") {
      const value = args[index + 1];
      if (value !== "media" && value !== "still") {
        throw new Error(`Invalid --output-format value: ${value}`);
      }
      outputFormat = value;
      index += 1;
      continue;
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (token === "--resolve-composition-metadata") {
      resolveCompositionMetadata = true;
      continue;
    }

    if (token === "--fps") {
      overrides.fps = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--duration-in-frames") {
      overrides.durationInFrames = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--width") {
      overrides.width = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--height") {
      overrides.height = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--include-alpha") {
      overrides.includeAlpha = true;
      continue;
    }

    if (token === "--color-space") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --color-space.");
      }
      overrides.colorSpace = value;
      index += 1;
      continue;
    }

    if (token === "--pixel-format") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --pixel-format.");
      }
      overrides.pixelFormat = value;
      index += 1;
      continue;
    }

    if (token === "--chrome-mode") {
      const value = args[index + 1];
      if (value !== "headless-shell" && value !== "default") {
        throw new Error(`Invalid --chrome-mode value: ${value}`);
      }
      overrides.chromeMode = value;
      index += 1;
      continue;
    }

    if (token === "--chromium-gl") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --chromium-gl.");
      }
      overrides.chromiumOptionsGl = value;
      index += 1;
      continue;
    }

    if (token === "--renderer-resolved") {
      const value = args[index + 1];
      if (value !== "webgl" && value !== "webgpu") {
        throw new Error(`Invalid --renderer-resolved value: ${value}`);
      }
      overrides.rendererResolved = value;
      index += 1;
      continue;
    }

    if (token === "--input-props-hash") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --input-props-hash.");
      }
      overrides.inputPropsHash = value;
      index += 1;
      continue;
    }

    if (token === "--effect-graph-hash") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --effect-graph-hash.");
      }
      overrides.effectGraphHash = value;
      index += 1;
      continue;
    }

    if (token === "--retention-days") {
      retentionDays = parseNumberOption(token, args[index + 1]);
      index += 1;
      continue;
    }

    if (token === "--no-cache") {
      noCache = true;
      continue;
    }

    if (token === "--no-placeholder-frame") {
      writePlaceholderFrame = false;
      continue;
    }

    throw new Error(`Unknown option: ${token}`);
  }

  return {
    compositionId,
    dryRun,
    effectsCompositionId,
    entryPoint,
    mode,
    noCache,
    outputFormat,
    resolveCompositionMetadata,
    retentionDays,
    sourceCompositionId,
    overrides,
    writePlaceholderFrame,
  };
};

const renderCreateSuccessMessage = (
  logger: Logger,
  result: CreateProjectResult,
): void => {
  const relativeProjectDir = path.relative(process.cwd(), result.projectDir) || result.projectDir;

  logger.log(`\n[create-remotion-reloaded] Created project in ${relativeProjectDir}`);

  if (result.installedDependencies) {
    logger.log("\nNext steps:");
    logger.log(`  cd ${relativeProjectDir}`);
    logger.log("  npm run preview");
    return;
  }

  logger.log("\nNext steps:");
  logger.log(`  cd ${relativeProjectDir}`);
  logger.log(`  ${result.packageManager} install`);
  logger.log("  npm run preview");
};

const runCreateCommand = async (
  args: readonly string[],
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const parsed = parseCreateArgs(args);
  const result = await createProject({
    cwd: options.cwd,
    logger,
    packageManager: detectPackageManager(),
    projectName: parsed.projectName,
    skipInstall: parsed.skipInstall,
    template: parsed.template,
  });

  renderCreateSuccessMessage(logger, result);
  return 0;
};

const runInitCommand = async (
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  await initProject({ cwd: options.cwd, logger });
  logger.log("[remotion-reloaded] Run your package manager install command if dependencies changed.");
  return 0;
};

const runDoctorCommand = async (
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const result = await runDoctor({ cwd: options.cwd, logger });
  return result.exitCode;
};

const runRenderCommand = async (
  args: readonly string[],
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const parsed = parseRenderArgs(args);
  const result = await runRenderPolicy({
    cwd: options.cwd,
    logger,
    compositionId: parsed.compositionId,
    chromeMode: parsed.chromeMode,
    requestedRenderer: parsed.requestedRenderer,
    allowUnsafeSinglePass: parsed.allowUnsafeSinglePass,
    fallbackOnTimeout: parsed.fallbackOnTimeout,
    maxDelayRenderMs: parsed.maxDelayRenderMs,
    noCache: parsed.noCache,
    entryPoint: parsed.entryPoint,
    effectsCompositionId: parsed.effectsCompositionId,
    executeRender: !parsed.dryRun,
    outputFormat: parsed.outputFormat,
    resolveCompositionMetadata: parsed.resolveCompositionMetadata,
  });

  return result.exitCode;
};

const runPrecompCommand = async (
  args: readonly string[],
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const parsed = parsePrecompArgs(args);
  const cwd = options.cwd ?? process.cwd();

  if (parsed.mode === "clean") {
    const result = cleanPrecompCache({
      cwd,
      logger,
      retentionDays: parsed.retentionDays,
    });
    logger.log(
      `[remotion-reloaded] Scanned ${result.scannedCacheDirectories} cache directories, removed ${result.deletedPaths.length}.`,
    );
    return 0;
  }

  const sourceCompositionId =
    parsed.sourceCompositionId ?? parsed.compositionId ?? "unknown-composition";
  const effectsCompositionId =
    parsed.effectsCompositionId ?? parsed.compositionId ?? sourceCompositionId;
  const scan = scanProjectRisk(cwd);
  const classification = classifyRenderRisk({
    compositionId: sourceCompositionId,
    renderMode: "render",
    chromeMode:
      (parsed.overrides.chromeMode as ClassifierChromeMode | undefined) ??
      "headless-shell",
    requestedRenderer: "auto",
    containsThreeCanvas: scan.containsThreeCanvas,
    effectTypes: scan.effectTypes,
    effectBackends: scan.effectBackends,
    environment: getRenderEnvironment(),
    chromiumOptionsGl: parsed.overrides.chromiumOptionsGl,
    concurrency: 0,
    colorSpace:
      typeof parsed.overrides.colorSpace === "string"
        ? parsed.overrides.colorSpace
        : "bt709",
  });

  const cacheInput = buildDefaultPrecompCacheInput(cwd, {
    compositionId: sourceCompositionId,
    ...parsed.overrides,
    effectGraphHash: parsed.overrides.effectGraphHash ?? scan.effectGraphHash,
    inputPropsHash:
      parsed.overrides.inputPropsHash ?? `props_${classification.fingerprint}`,
    rendererResolved:
      parsed.overrides.rendererResolved ??
      (classification.normalizedInput.requestedRenderer === "webgpu"
        ? "webgpu"
        : "webgl"),
  });

  const result = await runPrecomp({
    cwd,
    logger,
    sourceCompositionId,
    effectsCompositionId,
    entryPoint: parsed.entryPoint,
    executeRender: !parsed.dryRun,
    outputFormat: parsed.outputFormat,
    resolveCompositionMetadata: parsed.resolveCompositionMetadata,
    cacheInput,
    noCache: parsed.noCache,
    writePlaceholderFrame: parsed.writePlaceholderFrame,
  });

  logger.log(
    `[remotion-reloaded] Pre-comp ready. cacheKey=${result.cacheKey} (${result.cacheHit ? "cache-hit" : "cache-miss"}).`,
  );
  return 0;
};

export async function runCli(
  argv: readonly string[] = process.argv.slice(2),
  options: RunCliOptions = {},
): Promise<number> {
  const logger = options.logger ?? defaultLogger;
  const invokedAs = options.invokedAs ?? path.basename(process.argv[1] ?? "create-remotion-reloaded");

  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp(logger, invokedAs);
    return 0;
  }

  if (argv.includes("-v") || argv.includes("--version")) {
    logger.log(CLI_VERSION);
    return 0;
  }

  try {
    if (invokedAs === "remotion-reloaded") {
      const subcommand = argv[0];

      if (!subcommand) {
        printHelp(logger, invokedAs);
        return 1;
      }

      if (subcommand === "init") {
        return runInitCommand(options, logger);
      }

      if (subcommand === "doctor") {
        return runDoctorCommand(options, logger);
      }

      if (subcommand === "render") {
        return await runRenderCommand(argv.slice(1), options, logger);
      }

      if (subcommand === "precomp") {
        return await runPrecompCommand(argv.slice(1), options, logger);
      }

      if (subcommand === "create") {
        return runCreateCommand(argv.slice(1), options, logger);
      }

      throw new Error(`Unknown command: ${subcommand}`);
    }

    const command = argv[0];
    if (command === "init") {
      return runInitCommand(options, logger);
    }

    if (command === "doctor") {
      return runDoctorCommand(options, logger);
    }

    if (command === "render") {
      return await runRenderCommand(argv.slice(1), options, logger);
    }

    if (command === "precomp") {
      return await runPrecompCommand(argv.slice(1), options, logger);
    }

    if (command === "create") {
      return runCreateCommand(argv.slice(1), options, logger);
    }

    return runCreateCommand(argv, options, logger);
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Unexpected error while running CLI.",
    );
    return 1;
  }
}

export {
  createProject,
  detectPackageManager,
  initProject,
  runDoctor,
  runRenderPolicy,
  runPrecomp,
  cleanPrecompCache,
};

export type {
  CreateProjectOptions,
  CreateProjectResult,
  PackageManager,
} from "./create";
export type { InitProjectOptions, InitProjectResult } from "./init";
export type { DoctorCheck, DoctorOptions, DoctorResult } from "./doctor";
export type {
  PrecompCacheInput,
  PrecompOutputFormat,
  PrecompMetadata,
  RunPrecompOptions,
  RunPrecompResult,
  CleanPrecompOptions,
  CleanPrecompResult,
} from "./precomp";
export type { RenderPolicyOptions, RenderPolicyResult } from "./render";
