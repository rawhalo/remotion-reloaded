import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import type { ChromiumOptions } from "@remotion/renderer";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import type { VideoConfig } from "remotion/no-react";

type InputProps = Record<string, unknown> | undefined;
const GPU_ERROR_PATTERNS = [
  "error creating webgl context",
  "gpu process",
  "webgl is not supported",
  "gl is disabled",
  "contextresult::kfatalfailure",
  "webgpu unavailable",
];

export interface RenderFrameOptions {
  compositionId: string;
  frame: number;
  inputProps?: InputProps;
  chromiumOptions?: ChromiumOptions;
}

export interface RenderBenchmark {
  elapsedMs: number;
  samplesMs: number[];
  maxMs: number;
  minMs: number;
}

const entryPoint = fileURLToPath(new URL("../fixtures/index.tsx", import.meta.url));
const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));
const workspaceAlias = {
  "@remotion-reloaded/config": resolve(workspaceRoot, "packages/config/src/index.ts"),
  "@remotion-reloaded/effects": resolve(workspaceRoot, "packages/effects/src/index.ts"),
  "@remotion-reloaded/gsap": resolve(workspaceRoot, "packages/gsap/src/index.ts"),
  "@remotion-reloaded/three": resolve(workspaceRoot, "packages/three/src/index.ts"),
  "remotion-reloaded": resolve(workspaceRoot, "packages/remotion-reloaded/src/index.ts"),
  "remotion-reloaded/config": resolve(
    workspaceRoot,
    "packages/remotion-reloaded/src/config.ts",
  ),
};

let serveUrlPromise: Promise<string> | null = null;

type WebpackConfig = {
  module?: {
    rules?: unknown[];
  };
  resolve?: {
    alias?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function applyShaderRawImportRule(webpackConfig: WebpackConfig): WebpackConfig {
  const rules = webpackConfig.module?.rules ?? [];

  return {
    ...webpackConfig,
    module: {
      ...(webpackConfig.module ?? {}),
      rules: [
        ...rules,
        {
          test: /\.(wgsl|vert\.glsl|frag\.glsl|glsl)$/i,
          type: "asset/source",
        },
      ],
    },
  };
}

function applyWorkspaceAliases(webpackConfig: WebpackConfig): WebpackConfig {
  return {
    ...webpackConfig,
    resolve: {
      ...(webpackConfig.resolve ?? {}),
      alias: {
        ...(webpackConfig.resolve?.alias ?? {}),
        ...workspaceAlias,
      },
    },
  };
}

function getServeUrl(): Promise<string> {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint,
      onProgress: () => undefined,
      webpackOverride: (webpackConfig) =>
        applyWorkspaceAliases(applyShaderRawImportRule(webpackConfig)),
    });
  }

  return serveUrlPromise;
}

async function getComposition(
  compositionId: string,
  inputProps?: Record<string, unknown>,
): Promise<{ composition: VideoConfig; serveUrl: string }> {
  const serveUrl = await getServeUrl();
  const compositions = await getCompositions(serveUrl, {
    inputProps,
    logLevel: "error",
  });

  const composition = compositions.find((c) => c.id === compositionId);
  if (!composition) {
    const available = compositions.map((c) => c.id).join(", ");
    throw new Error(
      `Composition \"${compositionId}\" not found. Available: ${available}`,
    );
  }

  return { composition, serveUrl };
}

export async function renderFrameToBuffer(options: RenderFrameOptions): Promise<Buffer> {
  const { composition, serveUrl } = await getComposition(
    options.compositionId,
    options.inputProps,
  );

  const result = await renderStill({
    composition,
    frame: options.frame,
    imageFormat: "png",
    inputProps: options.inputProps,
    logLevel: "error",
    output: null,
    serveUrl,
    chromiumOptions: options.chromiumOptions,
  });

  if (!result.buffer) {
    throw new Error(
      `renderStill returned no buffer for composition ${options.compositionId}`,
    );
  }

  return result.buffer;
}

export async function benchmarkRender(
  options: RenderFrameOptions & {
    iterations?: number;
    warmupRuns?: number;
  },
): Promise<RenderBenchmark> {
  const iterations = Math.max(1, options.iterations ?? 3);
  const warmupRuns = Math.max(0, options.warmupRuns ?? 1);
  const samplesMs: number[] = [];

  for (let index = 0; index < warmupRuns; index += 1) {
    await renderFrameToBuffer(options);
  }

  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    await renderFrameToBuffer(options);
    samplesMs.push(performance.now() - start);
  }

  return {
    elapsedMs: samplesMs.reduce((sum, value) => sum + value, 0) / samplesMs.length,
    samplesMs,
    maxMs: Math.max(...samplesMs),
    minMs: Math.min(...samplesMs),
  };
}

export function isGpuUnavailableError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.message}\n${error.stack ?? ""}`
      : String(error);
  const normalized = message.toLowerCase();

  return GPU_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}
