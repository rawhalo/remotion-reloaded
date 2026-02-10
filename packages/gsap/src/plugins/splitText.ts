import type gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  assertPluginRegistered,
  registerSplitTextPlugin,
} from "./register";

/**
 * Ensures SplitText has been registered before use.
 */
export function ensureSplitTextPluginRegistered(): void {
  assertPluginRegistered("SplitText");
}

/**
 * Creates a SplitText instance and throws a clear registration error
 * when the plugin has not been registered.
 */
export function createSplitText(
  target: gsap.DOMTarget,
  vars?: SplitText.Vars,
): SplitText {
  ensureSplitTextPluginRegistered();
  return new SplitText(target, vars);
}

export { SplitText, registerSplitTextPlugin };
