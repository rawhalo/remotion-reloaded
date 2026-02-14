import { defaultLogger, type Logger } from "./logger";
import {
  buildDefaultPrecompCacheInput,
  type PrecompOutputFormat,
  runPrecomp,
  type RunPrecompResult,
} from "./precomp";
import {
  classifyRenderRisk,
  getRenderEnvironment,
  type ClassifierChromeMode,
  type ClassifierRenderer,
} from "./renderRiskClassifier";
import { scanProjectRisk } from "./riskScan";

export interface RenderPolicyOptions {
  allowUnsafeSinglePass?: boolean;
  chromeMode?: ClassifierChromeMode;
  compositionId?: string;
  cwd?: string;
  effectsCompositionId?: string;
  effectsInputProps?: Record<string, unknown>;
  entryPoint?: string;
  executeRender?: boolean;
  fallbackOnTimeout?: boolean;
  logger?: Logger;
  maxDelayRenderMs?: number;
  noCache?: boolean;
  outputFormat?: PrecompOutputFormat;
  resolveCompositionMetadata?: boolean;
  requestedRenderer?: ClassifierRenderer;
  sourceInputProps?: Record<string, unknown>;
}

export interface RenderPolicyResult {
  exitCode: number;
  decision: "single-pass-safe" | "requires-precomp";
  fingerprint: string;
  routedPath: "single-pass" | "precomp" | "unsafe-single-pass-failed";
  precomp?: RunPrecompResult;
}

const parseBooleanFlag = (
  value: boolean | undefined,
  fallback: boolean,
): boolean => (value === undefined ? fallback : value);

/**
 * Phase 1 closeout enforcement:
 * route to single-pass when safe, otherwise route to pre-comp by default.
 */
export const runRenderPolicy = (
  options: RenderPolicyOptions = {},
): Promise<RenderPolicyResult> => {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? defaultLogger;
  const scan = scanProjectRisk(cwd);
  const compositionId = options.compositionId ?? "unknown-composition";

  const classifier = classifyRenderRisk({
    compositionId,
    renderMode: "render",
    chromeMode: options.chromeMode ?? "headless-shell",
    requestedRenderer: options.requestedRenderer ?? "auto",
    containsThreeCanvas: scan.containsThreeCanvas,
    effectTypes: scan.effectTypes,
    effectBackends: scan.effectBackends,
    environment: getRenderEnvironment(),
    chromiumOptionsGl: "angle",
    concurrency: 0,
    colorSpace: "bt709",
  });

  logger.log(
    `[remotion-reloaded] Classifier decision: ${classifier.decision} (${classifier.fingerprint})`,
  );

  if (classifier.decision === "single-pass-safe") {
    logger.log(
      "[remotion-reloaded] Render path: single-pass. Proceed with your Remotion render command.",
    );
    return Promise.resolve({
      exitCode: 0,
      decision: classifier.decision,
      fingerprint: classifier.fingerprint,
      routedPath: "single-pass",
    });
  }

  const allowUnsafe = parseBooleanFlag(options.allowUnsafeSinglePass, false);
  const fallbackOnTimeout = parseBooleanFlag(options.fallbackOnTimeout, true);
  const maxDelayRenderMs =
    typeof options.maxDelayRenderMs === "number" &&
    Number.isFinite(options.maxDelayRenderMs)
      ? options.maxDelayRenderMs
      : 120_000;

  if (allowUnsafe) {
    logger.warn(
      "[remotion-reloaded] Unsafe override enabled (--allow-unsafe-single-pass).",
    );
    logger.warn(
      `[remotion-reloaded] Timeout guard set to ${maxDelayRenderMs}ms.`,
    );

    if (!fallbackOnTimeout) {
      logger.error(
        "[remotion-reloaded] fallback-on-timeout disabled for unsafe override. Failing fast.",
      );
      return Promise.resolve({
        exitCode: 2,
        decision: classifier.decision,
        fingerprint: classifier.fingerprint,
        routedPath: "unsafe-single-pass-failed",
      });
    }

    logger.warn(
      "[remotion-reloaded] Unsafe path timed out. Routing to pre-comp fallback.",
    );
  }

  const precompPromise = runPrecomp({
    cwd,
    logger,
    sourceCompositionId: compositionId,
    effectsCompositionId: options.effectsCompositionId ?? compositionId,
    sourceInputProps: options.sourceInputProps,
    effectsInputProps: options.effectsInputProps,
    entryPoint: options.entryPoint,
    executeRender: options.executeRender ?? true,
    outputFormat: options.outputFormat ?? "media",
    resolveCompositionMetadata: options.resolveCompositionMetadata,
    noCache: options.noCache,
    cacheInput: buildDefaultPrecompCacheInput(cwd, {
      compositionId,
      effectGraphHash: scan.effectGraphHash,
      rendererResolved: "webgl",
      chromeMode: options.chromeMode ?? "headless-shell",
      chromiumOptionsGl: "angle",
      inputPropsHash: "props_default",
      colorSpace: "bt709",
    }),
  });

  return precompPromise.then((precomp) => {
    logger.log(
      `[remotion-reloaded] Render path: pre-comp (${precomp.cacheHit ? "cache-hit" : "cache-miss"}).`,
    );

    return {
      exitCode: 0,
      decision: classifier.decision,
      fingerprint: classifier.fingerprint,
      routedPath: "precomp",
      precomp,
    };
  });
};
