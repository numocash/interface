import { useState } from "react";

import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";
import { FilterButton, RotateArrow } from "./Filter";

export const Sort: React.FC = () => {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"auto"}
      >
        <Module tw="p-1">
          <p>Volume</p>
          <p>24h change</p>
        </Module>
      </Drop>
      <FilterButton onClick={() => setShow(!show)} ref={setTargetRef}>
        <p>Sort by</p>
        <RotateArrow open={show} />
      </FilterButton>
    </>
  );
};
