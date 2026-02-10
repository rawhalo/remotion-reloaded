import {
  ThreeCanvas as RemotionThreeCanvas,
  type ThreeCanvasProps as RemotionThreeCanvasProps,
} from "@remotion/three";
import { useCurrentFrame, useRemotionEnvironment } from "remotion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebGLRenderer } from "three";
import { WebGPURenderer } from "three/webgpu";
import {
  detectWebGpuSupport,
  hasWebGpuApi,
  resolveRenderer,
  type RendererResolution,
  type ThreeRenderer,
} from "./rendererDetection";
import {
  resolveThreeQualityPreset,
  type ThreeQualityPresetName,
} from "./qualityPresets";

type ThreeFallbackRenderer = "webgl" | "software";
type GlProp = RemotionThreeCanvasProps["gl"];

type RootStateLike = {
  advance?: (time: number) => void;
};

const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === "function";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRendererInstance = (value: unknown): boolean =>
  isObject(value) && isFunction(value.render);

const asGlConfig = (gl: GlProp | undefined): Record<string, unknown> | undefined => {
  if (!gl || isFunction(gl) || isRendererInstance(gl)) {
    return undefined;
  }

  if (!isObject(gl)) {
    return undefined;
  }

  return gl;
};

const createWebGlRenderer = (config: Record<string, unknown>) =>
  new WebGLRenderer(config);

const createWebGpuRenderer = (config: Record<string, unknown>) => {
  const renderer = new WebGPURenderer(config);
  if (isFunction(renderer.init)) {
    void renderer.init();
  }

  return renderer;
};

export interface ThreeCanvasProps
  extends Omit<RemotionThreeCanvasProps, "frameloop" | "gl"> {
  renderer?: ThreeRenderer;
  fallbackRenderer?: ThreeFallbackRenderer;
  quality?: ThreeQualityPresetName;
  lambdaQuality?: Exclude<ThreeQualityPresetName, "auto">;
  gl?: GlProp;
  onRendererResolved?: (resolution: RendererResolution) => void;
}

/**
 * Remotion-aware Three canvas wrapper with renderer fallback and
 * environment-based quality defaults.
 */
export const ThreeCanvas = ({
  renderer = "webgl",
  fallbackRenderer = "webgl",
  quality = "auto",
  lambdaQuality = "lambda",
  gl: userGl,
  onCreated,
  onRendererResolved,
  dpr,
  shadows,
  ...rest
}: ThreeCanvasProps) => {
  const frame = useCurrentFrame();
  const { isRendering } = useRemotionEnvironment();
  const rootStateRef = useRef<RootStateLike | null>(null);
  const loggedFallbackRef = useRef(false);

  const [webGpuSupported, setWebGpuSupported] = useState<boolean>(() =>
    renderer === "webgpu" ? hasWebGpuApi() : false,
  );

  useEffect(() => {
    if (renderer !== "webgpu") {
      setWebGpuSupported(false);
      return;
    }

    let cancelled = false;
    void detectWebGpuSupport().then((supported) => {
      if (!cancelled) {
        setWebGpuSupported(supported);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [renderer]);

  const rendererResolution = useMemo(
    () => resolveRenderer(renderer, webGpuSupported),
    [renderer, webGpuSupported],
  );

  const qualityPreset = useMemo(
    () => resolveThreeQualityPreset({ quality, lambdaQuality }).preset,
    [quality, lambdaQuality],
  );

  const mergedGlConfig = useMemo(() => {
    const userGlConfig = asGlConfig(userGl);
    const qualityGlConfig = {
      ...qualityPreset.gl,
      ...(fallbackRenderer === "software"
        ? {
            antialias: false,
            powerPreference: "low-power" as const,
          }
        : null),
    };

    return userGlConfig
      ? {
          ...qualityGlConfig,
          ...userGlConfig,
        }
      : qualityGlConfig;
  }, [fallbackRenderer, qualityPreset.gl, userGl]);

  const gl = useMemo<GlProp>(() => {
    // If the caller provided a full renderer instance or renderer factory, do not alter it.
    if (isFunction(userGl) || isRendererInstance(userGl)) {
      return userGl;
    }

    if (rendererResolution.resolved !== "webgpu") {
      return mergedGlConfig;
    }

    return (defaultGlProps: unknown) => {
      const defaultConfig = isObject(defaultGlProps) ? defaultGlProps : {};
      const config = {
        ...defaultConfig,
        ...mergedGlConfig,
      };

      try {
        return createWebGpuRenderer(config);
      } catch (error) {
        console.warn(
          "[remotion-reloaded] Failed to initialize WebGPU renderer, falling back to WebGL.",
          error,
        );
        return createWebGlRenderer(config);
      }
    };
  }, [mergedGlConfig, rendererResolution.resolved, userGl]);

  useEffect(() => {
    onRendererResolved?.(rendererResolution);

    if (
      rendererResolution.requested === "webgpu" &&
      rendererResolution.resolved === "webgl" &&
      !loggedFallbackRef.current
    ) {
      console.info(
        "[remotion-reloaded] WebGPU unavailable, falling back to WebGL renderer.",
      );
      loggedFallbackRef.current = true;
    }
  }, [onRendererResolved, rendererResolution]);

  const handleCreated = useCallback<NonNullable<RemotionThreeCanvasProps["onCreated"]>>(
    (state) => {
      rootStateRef.current = state as RootStateLike;
      onCreated?.(state);
    },
    [onCreated],
  );

  useEffect(() => {
    if (isRendering) {
      return;
    }

    rootStateRef.current?.advance?.(performance.now());
  }, [frame, isRendering]);

  return (
    <RemotionThreeCanvas
      {...rest}
      dpr={dpr ?? qualityPreset.dpr}
      frameloop="never"
      gl={gl}
      onCreated={handleCreated}
      shadows={shadows ?? qualityPreset.shadows}
    />
  );
};
