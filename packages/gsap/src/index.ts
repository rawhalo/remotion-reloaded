export { useGSAP } from "./useGSAP";
export type { UseGSAPCallback, UseGSAPOptions, UseGSAPReturn } from "./useGSAP";

export {
  warnMissingTargets,
  warnDurationMismatch,
  createRebuildTracker,
} from "./warnings";

export { GSAPTimeline } from "./components/GSAPTimeline";
export type { GSAPTimelineProps } from "./components/GSAPTimeline";

export { GSAPFrom } from "./components/GSAPFrom";
export type { GSAPFromProps } from "./components/GSAPFrom";

export { GSAPTo } from "./components/GSAPTo";
export type { GSAPToProps } from "./components/GSAPTo";

export { GSAPSequence } from "./components/GSAPSequence";
export type { GSAPSequenceProps } from "./components/GSAPSequence";

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
  ensureMorphSVGPluginRegistered,
  morphSVG,
  type MorphSVGValue,
} from "./plugins/morphSVG";

export {
  DrawSVGPlugin,
  ensureDrawSVGPluginRegistered,
  drawSVG,
  type DrawSVGValue,
} from "./plugins/drawSVG";

export {
  SplitText,
  ensureSplitTextPluginRegistered,
  createSplitText,
} from "./plugins/splitText";
