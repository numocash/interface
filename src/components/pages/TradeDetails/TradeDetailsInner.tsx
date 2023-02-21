import { useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { Lendgine } from "../../../constants/types";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import {
  pickLongLendgines,
  pickShortLendgines,
} from "../../../utils/lendgines";
import { Times } from "./Chart/TimeSelector";
import { MainView } from "./MainView";
import { TradeColumn, TradeType } from "./TradeColumn/TradeColumn";

interface Props {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;
  lendgines: readonly Lendgine[];
}

interface ITradeDetails {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;

  timeframe: Times;
  setTimeframe: (val: Times) => void;

  trade: TradeType;
  setTrade: (val: TradeType) => void;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;

  close: boolean;
  setClose: (val: boolean) => void;

  lendgines: readonly Lendgine[];
}

const useTradeDetailsInternal = ({
  base,
  quote,
  lendgines,
}: {
  base?: WrappedTokenInfo;
  quote?: WrappedTokenInfo;
  lendgines?: readonly Lendgine[];
} = {}): ITradeDetails => {
  invariant(base && quote && lendgines);
  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_DAY);
  const [trade, setTrade] = useState<TradeType>(TradeType.Long);
  const [close, setClose] = useState(false);

  const longLendgine = pickLongLendgines(lendgines, base);
  const shortLendgine = pickShortLendgines(lendgines, base);

  const lendgine = longLendgine[0] ? longLendgine[0] : shortLendgine[0];
  invariant(lendgine);

  const [selectedLendgine, setSelectedLendgine] = useState<Lendgine>(lendgine);

  return {
    base,
    quote,

    timeframe,
    setTimeframe,

    selectedLendgine,
    setSelectedLendgine,

    trade,
    setTrade,

    close,
    setClose,

    lendgines,
  };
};

export const { Provider: TradeDetailsProvider, useContainer: useTradeDetails } =
  createContainer(useTradeDetailsInternal);

export const TradeDetailsInner: React.FC<Props> = ({
  base,
  quote,
  lendgines,
}: Props) => {
  return (
    <div tw="w-full grid grid-cols-3">
      <TradeDetailsProvider initialState={{ base, quote, lendgines }}>
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
