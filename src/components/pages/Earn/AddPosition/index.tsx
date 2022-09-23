import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink, useParams } from "react-router-dom";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useAddressToMarket } from "../../../../contexts/environment";
import { LoadingPage } from "../../../common/LoadingPage";
import { Review } from "./Review";
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

export const AddPosition: React.FC = () => {
  const { marketAddress } = useParams<{
    marketAddress: string;
  }>();

  const market = useAddressToMarket(marketAddress ?? null);

  return market ? (
    <div tw="flex flex-col gap-3 max-w-2xl w-full">
      <NavLink to={`/pool`} tw="flex items-center text-xs">
        <div tw="text-xs flex gap-1.5 items-center text-default ">
          <FaChevronLeft />
          Back to pool list
        </div>
      </NavLink>
      <AddPositionProvider initialState={{ market }}>
        <SelectAmount />
        <Review />
      </AddPositionProvider>
    </div>
  ) : (
    <LoadingPage />
  );
};
