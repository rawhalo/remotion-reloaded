import type gsap from "gsap";

export interface GSAPToProps {
  target: gsap.TweenTarget;
  vars?: gsap.TweenVars;
  duration?: number;
  ease?: gsap.TweenVars["ease"];
  position?: gsap.Position;
  stagger?: gsap.TweenVars["stagger"];
}

/**
 * Declarative "to" tween instruction for <GSAPTimeline>.
 * This component is consumed by GSAPTimeline and does not render DOM.
 */
export function GSAPTo(_props: GSAPToProps): null {
  return null;
}
