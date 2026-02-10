import type { EffectType } from "./types";

const PREFIX = "[remotion-reloaded]";

export class UnknownEffectTypeError extends Error {
  constructor(requestedType: string, availableEffects: readonly string[]) {
    super(
      `${PREFIX} Unknown effect type "${requestedType}". Available effects: ${availableEffects.join(", ")}`,
    );
    this.name = "UnknownEffectTypeError";
  }
}

function shouldWarn(): boolean {
  return process.env.NODE_ENV !== "production";
}

function printableValue(value: unknown): string {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }

  return Object.prototype.toString.call(value);
}

export function warnClampedParameter(
  effectType: EffectType,
  parameterName: string,
  value: number,
  clampedValue: number,
  min: number | undefined,
  max: number | undefined,
): void {
  if (!shouldWarn()) {
    return;
  }

  const bounds = [min, max].filter((entry) => entry !== undefined).join("...");
  console.warn(
    `${PREFIX} Effect "${effectType}" prop "${parameterName}" value ${value} is invalid. Clamped to ${clampedValue}${bounds ? ` (expected ${bounds})` : ""}.`,
  );
}

export function warnInvalidParameterType(
  effectType: EffectType,
  parameterName: string,
  expectedType: "boolean" | "number" | "string",
  receivedValue: unknown,
  fallbackValue: boolean | number | string,
): void {
  if (!shouldWarn()) {
    return;
  }

  console.warn(
    `${PREFIX} Effect "${effectType}" prop "${parameterName}" expected ${expectedType} but received ${printableValue(
      receivedValue,
    )}. Using default ${printableValue(fallbackValue)}.`,
  );
}
