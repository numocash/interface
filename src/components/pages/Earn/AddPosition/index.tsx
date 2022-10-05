import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { createContainer } from "unstated-next";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { ConfirmButton } from "./Button";
import { SelectAmount } from "./SelectAmount";

interface IAddPosition {
  market: IMarket | null;
  userInfo: IMarketUserInfo | null;

  speculativeTokenAmount: TokenAmount | null;
  setSpeculativeTokenAmount: (val: TokenAmount) => void;

  baseTokenAmount: TokenAmount | null;
  setBaseTokenAmount: (val: TokenAmount) => void;
}

const useAddPositionInternal = ({
  market,
  userInfo,
}: {
  market?: IMarket;
  userInfo?: IMarketUserInfo;
} = {}): IAddPosition => {
  const [speculativeTokenAmount, setSpeculativeTokenAmount] =
    useState<TokenAmount | null>(null);

  const [baseTokenAmount, setBaseTokenAmount] = useState<TokenAmount | null>(
    null
  );

  return {
    market: market ?? null,
    userInfo: userInfo ?? null,

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
  userInfo: IMarketUserInfo;
}

export const AddPosition: React.FC<Props> = ({ market, userInfo }) => {
  return (
    <div tw="flex flex-col gap-3  w-full">
      <AddPositionProvider initialState={{ market, userInfo }}>
        <SelectAmount />
        <ConfirmButton />
      </AddPositionProvider>
    </div>
  );
};
