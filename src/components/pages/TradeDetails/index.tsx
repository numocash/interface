import type { Token } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import {
  useAddressToToken,
  useSortDenomTokens,
} from "../../../hooks/useTokens";
import { MainView } from "./MainView";
import { Times } from "./TimeSelector";
import { TradeColumn } from "./TradeColumn";

interface ITradeDetails {
  denom: Token;
  other: Token;

  timeframe: Times;
  setTimeframe: (val: Times) => void;
}

const useTradeDetailsInternal = (): ITradeDetails => {
  const navigate = useNavigate();

  const { addressA, addressB } = useParams<{
    addressA: string;
    addressB: string;
  }>();
  if (!addressA || !addressB) navigate("/trade/");
  invariant(addressA && addressB);

  try {
    getAddress(addressA);
    getAddress(addressB);
  } catch (err) {
    console.error(err);
    navigate("/trade/");
  }

  const tokenA = useAddressToToken(addressA);
  const tokenB = useAddressToToken(addressB);
  if (!tokenA || !tokenB) navigate("/trade/");
  invariant(tokenA && tokenB);

  const { denom, other: quote } = useSortDenomTokens([tokenA, tokenB] as const);

  // TODO: handle nonAddresses
  // TODO: verify correct ordering

  if (!denom || !quote) navigate("/trade/");
  invariant(denom && quote, "Invalid token addresses");

  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_DAY);

  return { denom, other: quote, timeframe, setTimeframe };
};

export const { Provider: TradeDetailsProvider, useContainer: useTradeDetails } =
  createContainer(useTradeDetailsInternal);

export const TradeDetails: React.FC = () => {
  return (
    <div tw="w-full grid grid-cols-3">
      <TradeDetailsProvider>
        <MainView />
        <div tw="flex max-w-sm justify-self-end">
          {/* TODO: stick to the right side */}
          <div tw="border-l-2 border-gray-200 sticky h-[75vh] min-h-[50rem] mt-[-1rem]" />
          <TradeColumn tw="" />
        </div>
      </TradeDetailsProvider>
    </div>
  );
};
