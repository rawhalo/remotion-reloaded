import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

export type GSAPPluginName = "MorphSVGPlugin" | "SplitText" | "DrawSVGPlugin";

const registeredPlugins = new Set<GSAPPluginName>();

const registrationHints: Record<GSAPPluginName, string> = {
  MorphSVGPlugin:
    "Import '@remotion-reloaded/gsap/morphsvg' or call registerMorphSVGPlugin().",
  SplitText:
    "Import '@remotion-reloaded/gsap/splittext' or call registerSplitTextPlugin().",
  DrawSVGPlugin:
    "Import '@remotion-reloaded/gsap/drawsvg' or call registerDrawSVGPlugin().",
};

export class PluginNotRegisteredError extends Error {
  constructor(pluginName: GSAPPluginName) {
    super(
      `[remotion-reloaded] ${pluginName} is not registered. ${registrationHints[pluginName]} You can also import '@remotion-reloaded/gsap/register-all'.`,
    );
    this.name = "PluginNotRegisteredError";
  }
}

function registerPlugin(pluginName: GSAPPluginName, plugin: unknown): void {
  if (registeredPlugins.has(pluginName)) {
    return;
  }

  gsap.registerPlugin(plugin as gsap.Plugin);
  registeredPlugins.add(pluginName);
}

export function registerMorphSVGPlugin(): void {
  registerPlugin("MorphSVGPlugin", MorphSVGPlugin);
}

export function registerSplitTextPlugin(): void {
  registerPlugin("SplitText", SplitText);
}

export function registerDrawSVGPlugin(): void {
  registerPlugin("DrawSVGPlugin", DrawSVGPlugin);
}

export function registerAllGSAPPlugins(): void {
  registerMorphSVGPlugin();
  registerSplitTextPlugin();
  registerDrawSVGPlugin();
}

export function isPluginRegistered(pluginName: GSAPPluginName): boolean {
  return registeredPlugins.has(pluginName);
}

export function assertPluginRegistered(pluginName: GSAPPluginName): void {
  if (!isPluginRegistered(pluginName)) {
    throw new PluginNotRegisteredError(pluginName);
  }
}
