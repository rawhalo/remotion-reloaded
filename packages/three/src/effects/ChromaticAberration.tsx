import {
  ChromaticAberration as PostprocessingChromaticAberration,
} from "@react-three/postprocessing";
import type { ComponentPropsWithoutRef } from "react";

export type ChromaticAberrationProps = ComponentPropsWithoutRef<
  typeof PostprocessingChromaticAberration
>;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing ChromaticAberration.
 */
export const ChromaticAberration = (props: ChromaticAberrationProps) =>
  <PostprocessingChromaticAberration {...props} />;
