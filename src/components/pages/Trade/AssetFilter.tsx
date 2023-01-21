import type { Dispatch, SetStateAction } from "react";

import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";

interface Props {
  targetRef: HTMLElement | null;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export const AssetFilter: React.FC<Props> = ({
  targetRef,
  show,
  setShow,
}: Props) => {
  return (
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
  );
};
