import { getAddress } from "@ethersproject/address";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { Lendgine } from "../../../constants";
import { useLendginesForTokens } from "../../../hooks/useLendgine";
import {
  useAddressToToken,
  useSortDenomTokens,
} from "../../../hooks/useTokens";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { pickLongLendgines } from "../../../utils/lendgines";
import { MainView } from "./MainView";
import { Times } from "./TimeSelector";
import { TradeColumn, TradeType } from "./TradeColumn";

interface ITradeDetails {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;

  timeframe: Times;
  setTimeframe: (val: Times) => void;

  trade: TradeType;
  setTrade: (val: TradeType) => void;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;

  lendgines: Lendgine[];
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

  const [base, quote] = useSortDenomTokens([tokenA, tokenB] as const);

  // TODO: handle nonAddresses
  // TODO: verify correct ordering

  if (!base || !quote) navigate("/trade/");
  invariant(base && quote, "Invalid token addresses");

  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_DAY);
  const [trade, setTrade] = useState<TradeType>(TradeType.Long);

  const lendgines = useLendginesForTokens([base, quote] as const);
  invariant(lendgines);

  const longLendgine = pickLongLendgines(lendgines, base)[0];
  invariant(longLendgine);

  const [selectedLendgine, setSelectedLendgine] =
    useState<Lendgine>(longLendgine);

  return {
    base: base,
    quote: quote,
    timeframe,
    setTimeframe,
    lendgines,
    selectedLendgine,
    setSelectedLendgine,
    trade,
    setTrade,
  };
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
