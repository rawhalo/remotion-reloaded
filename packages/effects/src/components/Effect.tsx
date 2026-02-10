import { useId, type ReactElement } from "react";
import { composeCssFilters } from "../engine/cssFilter";
import { createSvgFilterId, renderSvgFilterElement } from "../engine/svgFilter";
import { resolveEffectPlan } from "../engine/registry";
import type { EffectProps } from "../types";

const EFFECT_COMPONENT_MARKER = "__remotionReloadedEffectComponent";

/**
 * Apply a visual effect to children using the CSS/SVG filter engine.
 */
export function Effect(props: EffectProps): ReactElement | null {
  const { children, className, style, type, ...rawParameters } = props;

  if (children == null) {
    return null;
  }

  const resolved = resolveEffectPlan(type, rawParameters);
  const scopeId = useId();
  const svgFilterId = resolved.svgFilter
    ? createSvgFilterId(String(type), scopeId)
    : undefined;
  const filter = composeCssFilters(
    svgFilterId ? `url(#${svgFilterId})` : undefined,
    resolved.cssFilter,
    typeof style?.filter === "string" ? style.filter : undefined,
  );

  const wrapperStyle = {
    ...resolved.wrapperStyle,
    ...style,
    ...(filter ? { filter } : {}),
    position: "relative" as const,
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
