import { Children, Fragment, isValidElement, type ReactElement } from "react";
import { Effect, isEffectElement } from "./Effect";
import type { EffectProps, EffectStackProps } from "../types";

/**
 * Composes multiple effects in order (top-to-bottom declaration order).
 */
export function EffectStack({ children }: EffectStackProps): ReactElement | null {
  const effectDescriptors: ReactElement<EffectProps>[] = [];
  const content: ReactElement[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        content.push(<Fragment key={`content-${content.length}`}>{child}</Fragment>);
      }
      return;
    }

    if (isEffectElement(child) && child.props.children === undefined) {
      effectDescriptors.push(child as ReactElement<EffectProps>);
      return;
    }

    content.push(child as ReactElement);
  });

  if (content.length === 0) {
    return null;
  }

  const contentNode =
    content.length === 1 ? content[0] : <Fragment>{content}</Fragment>;

  return effectDescriptors.reduce((accumulator, effectDescriptor, index) => {
    const { children: _ignoredChildren, ...effectProps } = effectDescriptor.props;
    return (
      <Effect key={`effect-stack-layer-${index}`} {...effectProps}>
        {accumulator}
      </Effect>
    );
  }, contentNode);
}
