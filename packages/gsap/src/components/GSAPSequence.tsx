import type gsap from "gsap";
import type { ReactNode } from "react";

export interface GSAPSequenceProps {
  children: ReactNode;
  position?: gsap.Position;
}

/**
 * Declarative nested timeline instruction for <GSAPTimeline>.
 * This component is consumed by GSAPTimeline and does not render DOM.
 */
export function GSAPSequence(_props: GSAPSequenceProps): null {
  return null;
}
