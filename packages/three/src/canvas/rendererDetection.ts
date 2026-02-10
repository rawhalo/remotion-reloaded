export type ThreeRenderer = "webgl" | "webgpu";

export type RendererResolutionReason =
  | "webgl-requested"
  | "webgpu-supported"
  | "webgpu-unavailable";

export interface RendererResolution {
  requested: ThreeRenderer;
  resolved: ThreeRenderer;
  reason: RendererResolutionReason;
}

type NavigatorWithGpu = Navigator & {
  gpu?: {
    requestAdapter?: () => Promise<unknown>;
  };
};

const getNavigator = (): NavigatorWithGpu | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return navigator as NavigatorWithGpu;
};

export function hasWebGpuApi(nav: Navigator | undefined = getNavigator()): boolean {
  const navigatorWithGpu = nav as NavigatorWithGpu | undefined;
  return Boolean(navigatorWithGpu?.gpu);
}

export async function detectWebGpuSupport(
  nav: Navigator | undefined = getNavigator(),
): Promise<boolean> {
  const navigatorWithGpu = nav as NavigatorWithGpu | undefined;

  if (!navigatorWithGpu?.gpu) {
    return false;
  }

  if (typeof navigatorWithGpu.gpu.requestAdapter !== "function") {
    return true;
  }

  try {
    const adapter = await navigatorWithGpu.gpu.requestAdapter();
    return Boolean(adapter);
  } catch {
    return false;
  }
}

export function resolveRenderer(
  requested: ThreeRenderer,
  webGpuSupported: boolean,
): RendererResolution {
  if (requested === "webgl") {
    return {
      requested,
      resolved: "webgl",
      reason: "webgl-requested",
    };
  }

  if (webGpuSupported) {
    return {
      requested,
      resolved: "webgpu",
      reason: "webgpu-supported",
    };
  }

  return {
    requested,
    resolved: "webgl",
    reason: "webgpu-unavailable",
  };
}
