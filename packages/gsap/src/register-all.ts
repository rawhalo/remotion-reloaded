import { registerAllGSAPPlugins } from "./plugins/register";

registerAllGSAPPlugins();

export {
  registerAllGSAPPlugins,
  registerMorphSVGPlugin,
  registerSplitTextPlugin,
  registerDrawSVGPlugin,
  isPluginRegistered,
  assertPluginRegistered,
  PluginNotRegisteredError,
  type GSAPPluginName,
} from "./plugins/register";

export {
  MorphSVGPlugin,
  registerMorphSVGPlugin as registerMorphSVG,
  ensureMorphSVGPluginRegistered,
  morphSVG,
  type MorphSVGValue,
} from "./plugins/morphSVG";

export {
  DrawSVGPlugin,
  registerDrawSVGPlugin as registerDrawSVG,
  ensureDrawSVGPluginRegistered,
  drawSVG,
  type DrawSVGValue,
} from "./plugins/drawSVG";

export {
  SplitText,
  registerSplitTextPlugin as registerSplitText,
  ensureSplitTextPluginRegistered,
  createSplitText,
} from "./plugins/splitText";
