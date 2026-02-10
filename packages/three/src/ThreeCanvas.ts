import type { ReactNode } from "react";

export interface ThreeCanvasProps {
  renderer?: "webgpu" | "webgl";
  children: ReactNode;
  width?: number;
  height?: number;
}

/**
 * A Remotion-aware Three.js canvas that uses frameloop="never"
 * and advances rendering per Remotion frame via useCurrentFrame().
 */
export function ThreeCanvas(_props: ThreeCanvasProps): ReactNode {
  // TODO: Task 2.1 — full implementation
  // - Wrap @remotion/three's ThreeCanvas or build custom R3F Canvas
  // - Set frameloop="never", advance via invalidate() per frame
  // - Support WebGPU renderer opt-in
  throw new Error(
    "ThreeCanvas is not yet implemented. See Task 2.1 in the implementation plan.",
  );
}
