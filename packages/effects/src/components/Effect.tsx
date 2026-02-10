import { getRenderEnvironment } from "@remotion-reloaded/config";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { composeCssFilters } from "../engine/cssFilter";
import { createSvgFilterId, renderSvgFilterElement } from "../engine/svgFilter";
import { resolveEffectPlan } from "../engine/registry";
import { WebGLPipeline, supportsWebGl } from "../engine/webglPipeline";
import type { EffectProps, EffectType, WebGLFilterPlan } from "../types";

const EFFECT_COMPONENT_MARKER = "__remotionReloadedEffectComponent";
const WEBGL_PERF_WARNING_MS = 5;
const WEBGL_DEFAULT_FPS = 30;

interface WebGLEffectWrapperProps {
  children: ReactNode;
  className: string | undefined;
  plan: WebGLFilterPlan;
  style: CSSProperties | undefined;
  type: EffectType;
}

function WebGLEffectWrapper({
  children,
  className,
  plan,
  style,
  type,
}: WebGLEffectWrapperProps): ReactElement {
  const sourceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipelineRef = useRef<WebGLPipeline | null>(null);
  const uniformsRef = useRef(plan.uniforms);
  const frameRef = useRef(0);
  const renderingRef = useRef(false);
  const perfWarningRef = useRef(false);

  const environment = getRenderEnvironment();
  const shouldSkip = environment === "lambda" && plan.fallbackMode === "skip";

  const [mode, setMode] = useState<"fallback" | "skip" | "source" | "webgl">(
    shouldSkip ? "skip" : "source",
  );

  useEffect(() => {
    uniformsRef.current = plan.uniforms;
  }, [plan.uniforms]);

  useEffect(() => {
    if (shouldSkip) {
      setMode("skip");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const sourceElement = sourceRef.current;
    const canvasElement = canvasRef.current;
    if (!sourceElement || !canvasElement) {
      return;
    }

    if (!supportsWebGl(canvasElement)) {
      setMode("fallback");
      return;
    }

    let cancelled = false;
    let rafId = 0;

    try {
      pipelineRef.current = new WebGLPipeline(canvasElement, plan.shader);
    } catch (error) {
      console.warn(
        `[remotion-reloaded] Failed to initialize WebGL pipeline for effect "${String(type)}". Falling back.`,
        error,
      );
      setMode("fallback");
      return;
    }

    setMode("source");

    const tick = () => {
      if (cancelled) {
        return;
      }

      const pipeline = pipelineRef.current;
      const currentSource = sourceRef.current;
      if (!pipeline || !currentSource || renderingRef.current) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      renderingRef.current = true;

      void pipeline
        .renderElement({
          element: currentSource,
          fps: WEBGL_DEFAULT_FPS,
          frame: frameRef.current,
          uniforms: uniformsRef.current,
        })
        .then((renderCost) => {
          if (cancelled) {
            return;
          }

          frameRef.current += 1;

          if (renderCost === null) {
            setMode("fallback");
            return;
          }

          setMode("webgl");

          if (renderCost > WEBGL_PERF_WARNING_MS && !perfWarningRef.current) {
            perfWarningRef.current = true;
            console.warn(
              `[remotion-reloaded] WebGL effect "${String(type)}" render cost ${renderCost.toFixed(2)}ms exceeds ${WEBGL_PERF_WARNING_MS}ms target.`,
            );
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.warn(
              `[remotion-reloaded] WebGL effect "${String(type)}" failed while rendering. Falling back.`,
              error,
            );
            setMode("fallback");
          }
        })
        .finally(() => {
          renderingRef.current = false;
        });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      renderingRef.current = false;
      pipelineRef.current?.dispose();
      pipelineRef.current = null;
    };
  }, [plan.shader, shouldSkip, type]);

  const fallbackFilter = mode === "fallback" ? plan.fallbackCssFilter : undefined;
  const mergedFilter = composeCssFilters(
    fallbackFilter,
    typeof style?.filter === "string" ? style.filter : undefined,
  );

  const wrapperStyle: CSSProperties = {
    ...style,
    ...(mergedFilter ? { filter: mergedFilter } : {}),
    position: "relative",
  };

  const sourceStyle: CSSProperties = {
    ...(mode === "webgl" ? { opacity: 0 } : null),
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      data-remotion-reloaded-effect="true"
      data-effect-type={type}
      data-webgl-mode={mode}
    >
      <div ref={sourceRef} style={sourceStyle}>
        {children}
      </div>
      {mode !== "skip" ? (
        <canvas
          aria-hidden="true"
          ref={canvasRef}
          style={{
            height: "100%",
            inset: 0,
            opacity: mode === "webgl" ? 1 : 0,
            pointerEvents: "none",
            position: "absolute",
            width: "100%",
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Apply a visual effect to children using the CSS/SVG/WebGL filter engine.
 */
export function Effect(props: EffectProps): ReactElement | null {
  const { children, className, style, type, ...rawParameters } = props;

  if (children == null) {
    return null;
  }

  const resolved = resolveEffectPlan(type, rawParameters);
  const scopeId = useId();

  if (resolved.webglFilter) {
    return (
      <WebGLEffectWrapper
        className={className}
        plan={resolved.webglFilter}
        style={style}
        type={type}
      >
        {children}
      </WebGLEffectWrapper>
    );
  }

  const svgFilterId = resolved.svgFilter
    ? createSvgFilterId(String(type), scopeId)
    : undefined;
  const filter = composeCssFilters(
    svgFilterId ? `url(#${svgFilterId})` : undefined,
    resolved.cssFilter,
    typeof style?.filter === "string" ? style.filter : undefined,
  );

  const wrapperStyle: CSSProperties = {
    ...resolved.wrapperStyle,
    ...style,
    ...(filter ? { filter } : {}),
    position: "relative",
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      data-remotion-reloaded-effect="true"
      data-effect-type={type}
    >
      {resolved.svgFilter && svgFilterId
        ? renderSvgFilterElement(svgFilterId, resolved.svgFilter)
        : null}
      {children}
      {resolved.overlayStyle ? (
        <div aria-hidden="true" style={resolved.overlayStyle} />
      ) : null}
    </div>
  );
}

(Effect as unknown as Record<string, unknown>)[EFFECT_COMPONENT_MARKER] = true;

export function isEffectElement(value: unknown): value is ReactElement<EffectProps> {
  if (
    typeof value !== "object" ||
    value === null ||
    !("type" in value)
  ) {
    return false;
  }

  const element = value as ReactElement;
  if (typeof element.type !== "function" && typeof element.type !== "object") {
    return false;
  }
  const elementType = element.type as unknown as Record<string, unknown>;
  return Boolean(elementType[EFFECT_COMPONENT_MARKER]);
}
