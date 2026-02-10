import type gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import {
  assertPluginRegistered,
  registerMorphSVGPlugin,
} from "./register";

export type MorphSVGValue = gsap.TweenVars["morphSVG"];

/**
 * Ensures MorphSVGPlugin has been registered before use.
 */
export function ensureMorphSVGPluginRegistered(): void {
  assertPluginRegistered("MorphSVGPlugin");
}

/**
 * Helper for morphSVG tween values that throws a clear registration error
 * when the plugin has not been registered.
 */
export function morphSVG(value: MorphSVGValue): MorphSVGValue {
  ensureMorphSVGPluginRegistered();
  return value;
}

export { MorphSVGPlugin, registerMorphSVGPlugin };
