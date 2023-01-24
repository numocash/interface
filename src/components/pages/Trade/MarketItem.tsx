import type { Token } from "@dahlia-labs/token-utils";
import { Percent } from "@dahlia-labs/token-utils";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import {
  sortTokens,
  useCurrentPrice,
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useUniswapPair";
import { TokenIcon } from "../../common/TokenIcon";
import { Times } from "../TradeDetails/TimeSelector";
import { MiniChart } from "./MiniChart";

interface Props {
  tokens: { denom: Token; other: Token };
}

export const MarketItem: React.FC<Props> = ({ tokens }: Props) => {
  const referenceMarketQuery = useMostLiquidMarket(tokens);

  const invertPriceQuery =
    sortTokens([tokens.denom, tokens.other])[0] === tokens.other;

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data,
    Times.ONE_DAY,
    invertPriceQuery
  );

  // tokens.other.symbol === "MAGIC" &&
  //   console.log(priceHistoryQuery.data[2]?.price.asNumber);

  const currentPriceQuery = useCurrentPrice(
    referenceMarketQuery.data,
    invertPriceQuery
  );

  const priceChange = useMemo(() => {
    if (!currentPriceQuery.data || !priceHistoryQuery.data) return null;

    const oneDayOldPrice =
      priceHistoryQuery.data[priceHistoryQuery.data.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return Percent.fromFraction(
      currentPriceQuery.data.subtract(oneDayOldPrice).divide(oneDayOldPrice)
    );
  }, [currentPriceQuery.data, priceHistoryQuery.data]);

  // return null;
  const loading =
    !priceHistoryQuery.data || !currentPriceQuery.data || !priceChange;

  return loading ? (
    <div tw="w-full h-14 duration-300 animate-pulse bg-gray-300 rounded-xl" />
  ) : (
    <div tw="w-full rounded-xl hover:bg-gray-200 transform ease-in-out duration-300 grid grid-cols-5 px-6 h-14 items-center justify-between">
      <div tw="flex items-center gap-3 col-span-2">
        <div tw="flex items-center space-x-[-0.5rem]">
          <TokenIcon token={tokens.other} size={32} />
          <TokenIcon token={tokens.denom} size={32} />
        </div>
        <div tw="grid gap-0.5">
          <span tw="font-semibold text-lg text-default leading-tight">
            {tokens.other.symbol} / {tokens.denom.symbol}
          </span>
        </div>
      </div>

      <MiniChart
        priceHistoryQuery={priceHistoryQuery}
        currentPriceQuery={currentPriceQuery}
      />

      <p tw="text-lg font-semibold justify-self-end">
        {priceChange.greaterThan(0) ? (
          <p tw="text-green-500 ">+{priceChange.toFixed(2)}%</p>
        ) : (
          <p tw="text-red">{priceChange.toFixed(2)}%</p>
        )}
      </p>
    </div>
  );
};
