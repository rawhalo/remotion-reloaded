import type gsap from "gsap";

export interface GSAPFromProps {
  target: gsap.TweenTarget;
  vars?: gsap.TweenVars;
  duration?: number;
  ease?: gsap.TweenVars["ease"];
  position?: gsap.Position;
  stagger?: gsap.TweenVars["stagger"];
}

/**
 * Declarative "from" tween instruction for <GSAPTimeline>.
 * This component is consumed by GSAPTimeline and does not render DOM.
 */
export function GSAPFrom(_props: GSAPFromProps): null {
  return null;
}
