import { Noise as PostprocessingNoise } from "@react-three/postprocessing";
import type { ComponentPropsWithoutRef } from "react";

export type NoiseProps = ComponentPropsWithoutRef<typeof PostprocessingNoise>;

/**
 * Remotion Reloaded wrapper for @react-three/postprocessing Noise.
 */
export const Noise = (props: NoiseProps) => <PostprocessingNoise {...props} />;
