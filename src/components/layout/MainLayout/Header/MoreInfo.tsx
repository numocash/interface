import { useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";

import { Drop } from "../../../common/Drop";
import { Module } from "../../../common/Module";
import { HeaderItem } from "./Nav";

export const MoreInfo: React.FC = () => {
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
        <Module>FUCK</Module>
      </Drop>
      <button onClick={() => setShow(true)} ref={setTargetRef}>
        <HeaderItem item={<AiOutlineMenu size={24} />} label="More" />
      </button>
    </>
  );
};
