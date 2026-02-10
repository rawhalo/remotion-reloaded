import { registerDrawSVGPlugin } from "./plugins/register";

registerDrawSVGPlugin();

export {
  DrawSVGPlugin,
  registerDrawSVGPlugin,
  ensureDrawSVGPluginRegistered,
  drawSVG,
  type DrawSVGValue,
} from "./plugins/drawSVG";
