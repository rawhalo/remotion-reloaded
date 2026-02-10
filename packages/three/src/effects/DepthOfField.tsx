import { DepthOfField as PostprocessingDepthOfField } from "@react-three/postprocessing";
import type { ComponentPropsWithoutRef } from "react";

export type DepthOfFieldProps = ComponentPropsWithoutRef<
  typeof PostprocessingDepthOfField
>;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing DepthOfField.
 */
export const DepthOfField = (props: DepthOfFieldProps) =>
  <PostprocessingDepthOfField {...props} />;
