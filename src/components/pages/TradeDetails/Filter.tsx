import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";

export const Filter: React.FC = () => {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  // TODO: close drop on click
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"auto"}
      >
        <Module tw="p-1">
          <p>ETH</p>
          <p>USDC</p>
        </Module>
      </Drop>
      <FilterButton onClick={() => !show && setShow(true)} ref={setTargetRef}>
        <p>Asset</p>
        <RotateArrow open={show} />
      </FilterButton>
    </>
  );
};

export const RotateArrow = styled(IoIosArrowDown)<{ open: boolean }>(
  ({ open }) => [
    tw`transition duration-300 ease-in-out`,
    open && tw`-rotate-180`,
  ]
);

export const FilterButton = styled.button`
  ${tw`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200`}
`;
