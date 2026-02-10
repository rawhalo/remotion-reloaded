import {
  EffectComposer as PostprocessingEffectComposer,
  type EffectComposerProps as PostprocessingEffectComposerProps,
} from "@react-three/postprocessing";

export type EffectComposerProps = PostprocessingEffectComposerProps;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing EffectComposer.
 */
export const EffectComposer = (props: EffectComposerProps) =>
  <PostprocessingEffectComposer {...props} />;
