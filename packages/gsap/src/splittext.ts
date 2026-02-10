import { registerSplitTextPlugin } from "./plugins/register";

registerSplitTextPlugin();

export {
  SplitText,
  registerSplitTextPlugin,
  ensureSplitTextPluginRegistered,
  createSplitText,
} from "./plugins/splitText";
