import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import type { VideoConfig } from "remotion/no-react";

type InputProps = Record<string, unknown> | undefined;

const entryPoint = fileURLToPath(new URL("../fixtures/index.tsx", import.meta.url));

let serveUrlPromise: Promise<string> | null = null;

function getServeUrl(): Promise<string> {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint,
      onProgress: () => undefined,
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

export async function renderFrameToBuffer(options: {
  compositionId: string;
  frame: number;
  inputProps?: InputProps;
}): Promise<Buffer> {
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
  });

  if (!result.buffer) {
    throw new Error(
      `renderStill returned no buffer for composition ${options.compositionId}`,
    );
  }

  return result.buffer;
}
