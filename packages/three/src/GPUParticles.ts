import type { ReactNode } from "react";

export interface GPUParticlesProps {
  count: number;
  behavior?: "flow-field" | "explosion" | "orbit" | "rain" | "snow";
  color?: string;
  size?: number;
}

/**
 * GPU-accelerated particle system using compute shaders.
 * Falls back to reduced particle count on non-GPU environments.
 */
export function GPUParticles(_props: GPUParticlesProps): ReactNode {
  // TODO: Task 2.2 — full implementation
  throw new Error(
    "GPUParticles is not yet implemented. See Task 2.2 in the implementation plan.",
  );
}
