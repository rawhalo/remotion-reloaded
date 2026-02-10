import { composeCssFilters, createGlowFilter, normalizeColor } from "../engine/cssFilter";
import type {
  AdvancedWebGLEffectType,
  ResolvedEffectPlan,
  WebGLFilterPlan,
  WebGLUniformValue,
} from "../types";

const HEX_3 = /^[0-9a-fA-F]{3}$/;
const HEX_6 = /^[0-9a-fA-F]{6}$/;

export function parseColorToVector3(
  color: string | undefined,
  fallback: string,
): [number, number, number] {
  const resolved = normalizeColor(color, fallback);
  const hex = resolved.startsWith("#") ? resolved.slice(1) : resolved;

  if (HEX_3.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return [r, g, b];
  }

  if (HEX_6.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return [r, g, b];
  }

  return [1, 1, 1];
}

interface BuildWebglPlanOptions {
  fallbackCssFilter?: string;
  fallbackMode?: WebGLFilterPlan["fallbackMode"];
  kind: AdvancedWebGLEffectType;
  shader: string;
  uniforms: Record<string, WebGLUniformValue>;
}

export function buildWebglPlan({
  fallbackCssFilter,
  fallbackMode = "skip",
  kind,
  shader,
  uniforms,
}: BuildWebglPlanOptions): ResolvedEffectPlan {
  return {
    webglFilter: {
      kind,
      shader,
      uniforms,
      fallbackMode,
      fallbackCssFilter,
    },
  };
}

export function createNeonFallbackCss(
  color: string,
  radius: number,
  intensity: number,
): string | undefined {
  return composeCssFilters(
    createGlowFilter(color, radius, intensity),
    `brightness(${(1 + 0.2 * intensity).toFixed(4)})`,
    `saturate(${(1 + 0.4 * intensity).toFixed(4)})`,
  );
}
