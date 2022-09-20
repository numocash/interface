import type { Placement } from "@popperjs/core";
import { animated, config, useTransition } from "@react-spring/web";
import React, { useCallback, useRef, useState } from "react";
import { usePopper } from "react-popper";
import tw, { css, styled } from "twin.macro";

import { useOnClickOutside } from "../../utils/onClickOutside";

const PopoverContainer = styled.div<{ show: boolean }>(({ show }) => [
  tw`invisible opacity-0`,
  show && tw`visible w-auto opacity-100`,
  css`
    z-index: 9997;
    transition: visibility 150ms linear, opacity 150ms linear;
  `,
]);

interface Props {
  onDismiss: () => void;
  show: boolean;
  target: Element | null;
  children: React.ReactNode;
  placement?: Placement;
}

export const Drop: React.FC<Props> = ({
  show,
  target,
  onDismiss,
  children,
  placement = "auto",
}: Props) => {
  const popperElRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, _setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  useOnClickOutside(popperElRef, show ? () => onDismiss() : undefined);

  const transition = useTransition(show, {
    from: { scale: 0.96, opacity: 1 },
    enter: { scale: 1, opacity: 1 },
    leave: { scale: 1, opacity: 0 },
    config: { ...config.default, duration: 100 },
  });

  const setPopperElement = useCallback((el: HTMLDivElement) => {
    popperElRef.current = el;
    _setPopperElement(el);
  }, []);

  const { styles, attributes } = usePopper(target, popperElement, {
    placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  // one container for positioning
  // one container for enter animation
  return (
    <PopoverContainer
      show={show}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {transition(
        (springStyles, item) =>
          item && <animated.div style={springStyles}>{children}</animated.div>
      )}
    </PopoverContainer>
  );
};
