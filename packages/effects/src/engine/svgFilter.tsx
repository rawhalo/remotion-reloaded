import type { ReactElement } from "react";
import { Fragment } from "react";
import type { SVGFilterPlan } from "../types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function sanitizeForSvgId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function parseHexColorToRgb(color: string): { b: number; g: number; r: number } {
  const trimmed = color.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  return { r: 255, g: 255, b: 255 };
}

export function createSvgFilterId(effectType: string, scopeId: string): string {
  return `rr-${sanitizeForSvgId(effectType)}-${sanitizeForSvgId(scopeId)}`;
}

function renderChromaticAberrationFilter(
  id: string,
  plan: Extract<SVGFilterPlan, { kind: "chromaticAberration" }>,
): ReactElement {
  const radians = (plan.angle * Math.PI) / 180;
  const dx = Math.cos(radians) * plan.offset;
  const dy = Math.sin(radians) * plan.offset;

  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feOffset in="SourceGraphic" dx={dx} dy={dy} result="redOffset" />
      <feColorMatrix
        in="redOffset"
        type="matrix"
        result="redChannel"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
      />

      <feColorMatrix
        in="SourceGraphic"
        type="matrix"
        result="greenChannel"
        values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
      />

      <feOffset in="SourceGraphic" dx={-dx} dy={-dy} result="blueOffset" />
      <feColorMatrix
        in="blueOffset"
        type="matrix"
        result="blueChannel"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
      />

      <feBlend in="redChannel" in2="greenChannel" mode="screen" result="rgMix" />
      <feBlend in="rgMix" in2="blueChannel" mode="screen" result="rgbMix" />
      <feComposite in="rgbMix" in2="SourceGraphic" operator="atop" />
    </filter>
  );
}

function renderNoiseFilter(
  id: string,
  plan: Extract<SVGFilterPlan, { kind: "noise" }>,
): ReactElement {
  const safeAmount = clamp01(plan.amount);

  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feTurbulence
        type="fractalNoise"
        baseFrequency={plan.baseFrequency}
        numOctaves={plan.octaves}
        seed={plan.seed}
        result="noisePattern"
      />
      <feColorMatrix
        in="noisePattern"
        type="matrix"
        result="grayscaleNoise"
        values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0"
      />
      <feComponentTransfer in="grayscaleNoise" result="noiseAlpha">
        <feFuncA type="table" tableValues={`0 ${safeAmount.toFixed(4)}`} />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="noiseAlpha" mode="multiply" />
    </filter>
  );
}

function renderDuotoneFilter(
  id: string,
  plan: Extract<SVGFilterPlan, { kind: "duotone" }>,
): ReactElement {
  const dark = parseHexColorToRgb(plan.dark);
  const light = parseHexColorToRgb(plan.light);
  const intensity = clamp01(plan.intensity);

  const lumR = 0.2126;
  const lumG = 0.7152;
  const lumB = 0.0722;

  const rangeR = (light.r - dark.r) / 255;
  const rangeG = (light.g - dark.g) / 255;
  const rangeB = (light.b - dark.b) / 255;

  const darkR = dark.r / 255;
  const darkG = dark.g / 255;
  const darkB = dark.b / 255;

  const matrix = [
    (1 - intensity + intensity * lumR * rangeR).toFixed(6),
    (intensity * lumG * rangeR).toFixed(6),
    (intensity * lumB * rangeR).toFixed(6),
    "0",
    (intensity * darkR).toFixed(6),
    (intensity * lumR * rangeG).toFixed(6),
    (1 - intensity + intensity * lumG * rangeG).toFixed(6),
    (intensity * lumB * rangeG).toFixed(6),
    "0",
    (intensity * darkG).toFixed(6),
    (intensity * lumR * rangeB).toFixed(6),
    (intensity * lumG * rangeB).toFixed(6),
    (1 - intensity + intensity * lumB * rangeB).toFixed(6),
    "0",
    (intensity * darkB).toFixed(6),
    "0",
    "0",
    "0",
    "1",
    "0",
  ].join(" ");

  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={matrix} />
    </filter>
  );
}

function renderDisplacementFilter(
  id: string,
  plan: Extract<SVGFilterPlan, { kind: "displacement" }>,
): ReactElement {
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feTurbulence
        type="fractalNoise"
        baseFrequency={plan.baseFrequency}
        numOctaves={2}
        seed={plan.seed}
        result="displacementNoise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="displacementNoise"
        scale={plan.scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

function renderFilterDefinition(id: string, plan: SVGFilterPlan): ReactElement {
  switch (plan.kind) {
    case "chromaticAberration":
      return renderChromaticAberrationFilter(id, plan);
    case "noise":
      return renderNoiseFilter(id, plan);
    case "duotone":
      return renderDuotoneFilter(id, plan);
    case "displacement":
      return renderDisplacementFilter(id, plan);
    default:
      return <Fragment />;
  }
}

export function renderSvgFilterElement(
  id: string,
  plan: SVGFilterPlan,
): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute" }}
    >
      <defs>{renderFilterDefinition(id, plan)}</defs>
    </svg>
  );
}
