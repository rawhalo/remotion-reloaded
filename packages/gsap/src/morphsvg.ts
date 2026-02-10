import { registerMorphSVGPlugin } from "./plugins/register";

registerMorphSVGPlugin();

export {
  MorphSVGPlugin,
  registerMorphSVGPlugin,
  ensureMorphSVGPluginRegistered,
  morphSVG,
  type MorphSVGValue,
} from "./plugins/morphSVG";
