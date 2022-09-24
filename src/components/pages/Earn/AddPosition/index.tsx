import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { SelectAmount } from "./SelectAmount";

interface IAddPosition {
  market: IMarket | null;

  speculativeTokenAmount: TokenAmount | null;
  setSpeculativeTokenAmount: (val: TokenAmount) => void;

  baseTokenAmount: TokenAmount | null;
  setBaseTokenAmount: (val: TokenAmount) => void;
}

const useAddPositionInternal = ({
  market,
}: {
  market?: IMarket;
} = {}): IAddPosition => {
  const [speculativeTokenAmount, setSpeculativeTokenAmount] =
    useState<TokenAmount | null>(null);

  const [baseTokenAmount, setBaseTokenAmount] = useState<TokenAmount | null>(
    null
  );

  return {
    market: market ?? null,

    speculativeTokenAmount,
    setSpeculativeTokenAmount,
    baseTokenAmount,
    setBaseTokenAmount,
  };
};

export const { Provider: AddPositionProvider, useContainer: useAddPosition } =
  createContainer(useAddPositionInternal);

interface Props {
  market: IMarket;
}

export const AddPosition: React.FC<Props> = ({ market }) => {
  return (
    <div tw="flex flex-col gap-3  w-full">
      <AddPositionProvider initialState={{ market }}>
        <SelectAmount />
      </AddPositionProvider>
    </div>
  );
};
