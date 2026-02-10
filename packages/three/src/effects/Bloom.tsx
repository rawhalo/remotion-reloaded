import { Bloom as PostprocessingBloom } from "@react-three/postprocessing";
import type { ComponentPropsWithoutRef } from "react";

export type BloomProps = ComponentPropsWithoutRef<typeof PostprocessingBloom>;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing Bloom.
 */
export const Bloom = (props: BloomProps) => <PostprocessingBloom {...props} />;
