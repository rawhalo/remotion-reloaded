import gsap from "gsap";
import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useGSAP, type UseGSAPOptions } from "../useGSAP";
import { GSAPFrom, type GSAPFromProps } from "./GSAPFrom";
import { GSAPTo, type GSAPToProps } from "./GSAPTo";
import { GSAPSequence, type GSAPSequenceProps } from "./GSAPSequence";

type TimelineInstruction =
  | { kind: "from"; props: GSAPFromProps }
  | { kind: "to"; props: GSAPToProps }
  | { kind: "sequence"; position?: gsap.Position; steps: TimelineInstruction[] };

export interface GSAPTimelineProps extends Pick<UseGSAPOptions, "fps" | "dependencies"> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function withTweenOverrides(
  vars: gsap.TweenVars | undefined,
  overrides: {
    duration?: number;
    ease?: gsap.TweenVars["ease"];
    stagger?: gsap.TweenVars["stagger"];
  },
): gsap.TweenVars {
  const next = { ...(vars ?? {}) } as gsap.TweenVars;

  if (overrides.duration !== undefined) {
    next.duration = overrides.duration;
  }
  if (overrides.ease !== undefined) {
    next.ease = overrides.ease;
  }
  if (overrides.stagger !== undefined) {
    next.stagger = overrides.stagger;
  }

  return next;
}

function collectInstructions(children: ReactNode): TimelineInstruction[] {
  const instructions: TimelineInstruction[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    if (child.type === Fragment) {
      instructions.push(...collectInstructions((child.props as { children?: ReactNode }).children));
      return;
    }

    if (child.type === GSAPFrom) {
      instructions.push({
        kind: "from",
        props: child.props as GSAPFromProps,
      });
      return;
    }

    if (child.type === GSAPTo) {
      instructions.push({
        kind: "to",
        props: child.props as GSAPToProps,
      });
      return;
    }

    if (child.type === GSAPSequence) {
      const sequenceProps = child.props as GSAPSequenceProps;
      instructions.push({
        kind: "sequence",
        position: sequenceProps.position,
        steps: collectInstructions(sequenceProps.children),
      });
    }
  });

  return instructions;
}

function collectRenderableChildren(children: ReactNode): ReactNode[] {
  const renderableChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") {
      return;
    }

    if (!isValidElement(child)) {
      renderableChildren.push(child);
      return;
    }

    if (child.type === Fragment) {
      renderableChildren.push(
        ...collectRenderableChildren((child.props as { children?: ReactNode }).children),
      );
      return;
    }

    if (
      child.type === GSAPFrom ||
      child.type === GSAPTo ||
      child.type === GSAPSequence
    ) {
      return;
    }

    renderableChildren.push(child);
  });

  return renderableChildren;
}

function applyInstructions(
  timeline: gsap.core.Timeline,
  instructions: TimelineInstruction[],
): void {
  for (const instruction of instructions) {
    if (instruction.kind === "from") {
      const { target, vars, duration, ease, stagger, position } = instruction.props;
      timeline.from(
        target,
        withTweenOverrides(vars, { duration, ease, stagger }),
        position,
      );
      continue;
    }

    if (instruction.kind === "to") {
      const { target, vars, duration, ease, stagger, position } = instruction.props;
      timeline.to(
        target,
        withTweenOverrides(vars, { duration, ease, stagger }),
        position,
      );
      continue;
    }

    const nestedTimeline = gsap.timeline({ paused: true });
    applyInstructions(nestedTimeline, instruction.steps);
    timeline.add(nestedTimeline, instruction.position);
  }
}

/**
 * Declarative container for building a GSAP timeline using child instructions.
 */
export function GSAPTimeline({
  children,
  fps,
  dependencies,
  className,
  style,
}: GSAPTimelineProps): ReactNode {
  const instructions = useMemo(() => collectInstructions(children), [children]);
  const renderableChildren = useMemo(
    () => collectRenderableChildren(children),
    [children],
  );

  const buildTimeline = useCallback(
    (timeline: gsap.core.Timeline) => {
      applyInstructions(timeline, instructions);
    },
    [instructions],
  );

  const { scopeRef } = useGSAP(buildTimeline, {
    fps,
    dependencies,
  });

  return (
    <div ref={scopeRef} className={className} style={style}>
      {renderableChildren}
    </div>
  );
}
