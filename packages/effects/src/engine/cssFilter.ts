import type { CSSProperties } from "react";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function composeCssFilters(
  ...parts: Array<string | undefined>
): string | undefined {
  const normalized = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0));

  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.join(" ");
}

export function normalizeColor(value: string | undefined, fallback: string): string {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function createGlowFilter(
  color: string,
  radius: number,
  intensity: number,
): string {
  const inner = Math.max(0, radius * 0.6 * intensity);
  const outer = Math.max(0, radius * 1.2 * intensity);

  return composeCssFilters(
    `drop-shadow(0 0 ${inner.toFixed(2)}px ${color})`,
    `drop-shadow(0 0 ${outer.toFixed(2)}px ${color})`,
  ) as string;
}

export function createVignetteOverlay(
  darkness: number,
  offset: number,
): CSSProperties {
  const safeDarkness = clamp01(darkness);
  const safeOffset = clamp01(offset);
  const innerStop = Math.round(safeOffset * 100);

  return {
    background: `radial-gradient(circle, rgba(0,0,0,0) ${innerStop}%, rgba(0,0,0,${safeDarkness.toFixed(3)}) 100%)`,
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  };
}
