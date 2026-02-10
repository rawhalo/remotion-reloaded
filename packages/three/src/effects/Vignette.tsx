import { Vignette as PostprocessingVignette } from "@react-three/postprocessing";
import type { ComponentPropsWithoutRef } from "react";

export type VignetteProps = ComponentPropsWithoutRef<typeof PostprocessingVignette>;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing Vignette.
 */
export const Vignette = (props: VignetteProps) =>
  <PostprocessingVignette {...props} />;
