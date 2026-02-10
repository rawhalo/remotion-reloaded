import type gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  assertPluginRegistered,
  registerDrawSVGPlugin,
} from "./register";

export type DrawSVGValue = gsap.TweenVars["drawSVG"];

/**
 * Ensures DrawSVGPlugin has been registered before use.
 */
export function ensureDrawSVGPluginRegistered(): void {
  assertPluginRegistered("DrawSVGPlugin");
}

/**
 * Helper for drawSVG tween values that throws a clear registration error
 * when the plugin has not been registered.
 */
export function drawSVG(value: DrawSVGValue): DrawSVGValue {
  ensureDrawSVGPluginRegistered();
  return value;
}

export { DrawSVGPlugin, registerDrawSVGPlugin };
