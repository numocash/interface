import type { Token } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { useAddressToToken } from "../../../hooks/useTokens";
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

  const { denom, quote } = useParams<{
    denom: string;
    quote: string;
  }>();

  if (!denom || !quote) navigate("/trade/");
  invariant(denom && quote);
  try {
    getAddress(denom);
    getAddress(quote);
  } catch (err) {
    console.error(err);
    navigate("/trade/");
  }

  const denomToken = useAddressToToken(denom);
  const quoteToken = useAddressToToken(quote);

  if (!denomToken || !quoteToken) navigate("/trade/");
  invariant(denomToken && quoteToken, "Invalid token addresses");

  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_DAY);

  return { denom: denomToken, other: quoteToken, timeframe, setTimeframe };
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
