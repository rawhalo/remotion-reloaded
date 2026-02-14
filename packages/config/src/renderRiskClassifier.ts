import type { RenderEnvironment } from "./environment";

export type ClassifierDecision = "single-pass-safe" | "requires-precomp";

export type ClassifierRenderMode = "studio" | "render";
export type ClassifierChromeMode = "headless-shell" | "default";
export type ClassifierRenderer = "auto" | "webgl" | "webgpu";

export type EffectBackend =
  | "composite"
  | "css"
  | "svg"
  | "three-post-native"
  | "unknown"
  | "webgl";

export interface ClassifierInput {
  compositionId: string;
  renderMode: ClassifierRenderMode;
  chromeMode: ClassifierChromeMode;
  requestedRenderer: ClassifierRenderer;
  containsThreeCanvas: boolean;
  effectTypes: string[];
  effectBackends: EffectBackend[];
  environment: RenderEnvironment;
  chromiumOptionsGl?: string;
  concurrency?: number | null;
  colorSpace?: string;
}

export type ClassifierReasonCode =
  | "RISK_THREE_WEBGL_EFFECT_HEADLESS_SHELL"
  | "RISK_THREE_WEBGL_EFFECT_RENDER_MODE"
  | "RISK_THREE_WEBGL_EFFECT_WEBGL_RENDERER"
  | "RISK_THREE_WEBGL_EFFECT_LAMBDA"
  | "SAFE_NO_RISKY_COMBINATION";

export interface ClassifierReason {
  code: ClassifierReasonCode;
  message: string;
  severity: "info" | "warn";
}

export interface NormalizedClassifierInput {
  compositionId: string;
  renderMode: ClassifierRenderMode;
  chromeMode: ClassifierChromeMode;
  requestedRenderer: ClassifierRenderer;
  containsThreeCanvas: boolean;
  effectTypes: string[];
  effectBackends: EffectBackend[];
  environment: RenderEnvironment;
  chromiumOptionsGl?: string;
  concurrency?: number | null;
  colorSpace?: string;
}

export interface ClassifierResult {
  decision: ClassifierDecision;
  reasons: ClassifierReason[];
  fingerprint: string;
  normalizedInput: NormalizedClassifierInput;
}

const WEBGL_BACKEND: EffectBackend = "webgl";

const normalizeString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sortUniqueStrings = (values: readonly string[]): string[] =>
  [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );

const stableSerialize = (value: unknown): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort((left, right) => left.localeCompare(right));

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
};

const hashString = (input: string): string => {
  // 2x 32-bit hashes combined for stable, cheap fingerprinting without Node crypto.
  let fnv = 0x811c9dc5;
  let djb = 5381;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    fnv ^= code;
    fnv = Math.imul(fnv, 0x01000193);

    djb = Math.imul(djb, 33) ^ code;
  }

  const left = (fnv >>> 0).toString(16).padStart(8, "0");
  const right = (djb >>> 0).toString(16).padStart(8, "0");
  return `${left}${right}`;
};

export const normalizeClassifierInput = (
  input: ClassifierInput,
): NormalizedClassifierInput => {
  return {
    compositionId: normalizeString(input.compositionId) ?? "unknown-composition",
    renderMode: input.renderMode,
    chromeMode: input.chromeMode,
    requestedRenderer: input.requestedRenderer,
    containsThreeCanvas: Boolean(input.containsThreeCanvas),
    effectTypes: sortUniqueStrings(input.effectTypes),
    effectBackends: sortUniqueStrings(input.effectBackends).map(
      (entry) => entry as EffectBackend,
    ),
    environment: input.environment,
    chromiumOptionsGl: normalizeString(input.chromiumOptionsGl),
    concurrency:
      typeof input.concurrency === "number" && Number.isFinite(input.concurrency)
        ? input.concurrency
        : null,
    colorSpace: normalizeString(input.colorSpace),
  };
};

const hasRiskyWebglBackends = (
  input: NormalizedClassifierInput,
): boolean => input.effectBackends.includes(WEBGL_BACKEND);

const buildFingerprint = (normalized: NormalizedClassifierInput): string => {
  const payload = stableSerialize(normalized);
  return `rrc_${hashString(payload)}`;
};

const addRiskReason = (
  reasons: ClassifierReason[],
  code: Exclude<ClassifierReasonCode, "SAFE_NO_RISKY_COMBINATION">,
  message: string,
): void => {
  reasons.push({
    code,
    message,
    severity: "warn",
  });
};

export const classifyRenderRisk = (input: ClassifierInput): ClassifierResult => {
  const normalized = normalizeClassifierInput(input);
  const reasons: ClassifierReason[] = [];
  const webglRisky = hasRiskyWebglBackends(normalized);
  const riskyThreeCombo = normalized.containsThreeCanvas && webglRisky;

  if (riskyThreeCombo && normalized.renderMode === "render") {
    addRiskReason(
      reasons,
      "RISK_THREE_WEBGL_EFFECT_RENDER_MODE",
      "ThreeCanvas with WebGL-backed effects in render mode is classified as risky.",
    );
  }

  if (riskyThreeCombo && normalized.chromeMode === "headless-shell") {
    addRiskReason(
      reasons,
      "RISK_THREE_WEBGL_EFFECT_HEADLESS_SHELL",
      "headless-shell plus ThreeCanvas and WebGL-backed effects is a known risk combination.",
    );
  }

  if (riskyThreeCombo && normalized.requestedRenderer === "webgl") {
    addRiskReason(
      reasons,
      "RISK_THREE_WEBGL_EFFECT_WEBGL_RENDERER",
      "Forcing a WebGL renderer with ThreeCanvas and WebGL-backed effects increases risk.",
    );
  }

  if (riskyThreeCombo && normalized.environment === "lambda") {
    addRiskReason(
      reasons,
      "RISK_THREE_WEBGL_EFFECT_LAMBDA",
      "AWS Lambda has no GPU acceleration for this combination; pre-comp is required.",
    );
  }

  if (reasons.length === 0) {
    reasons.push({
      code: "SAFE_NO_RISKY_COMBINATION",
      message: "No known risky ThreeCanvas + WebGL effect combination detected.",
      severity: "info",
    });
  }

  const decision: ClassifierDecision = reasons.some(
    (reason) => reason.severity === "warn",
  )
    ? "requires-precomp"
    : "single-pass-safe";

  return {
    decision,
    reasons,
    fingerprint: buildFingerprint(normalized),
    normalizedInput: normalized,
  };
};
