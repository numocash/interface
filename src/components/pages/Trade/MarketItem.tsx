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
import { Times } from "../TradeDetails/TimeSelector";

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

  // token0 = weth
  // token1 = usdc

  // denom token = usdc
  // other token = weth

  // uniswap price = weth / usdc

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
    <div tw="w-full h-12 duration-300 animate-pulse bg-gray-300 rounded-xl" />
  ) : (
    <div tw="w-full rounded-lg hover:bg-gray-200 transform ease-in-out duration-300 flex px-6 h-12 items-center justify-between">
      <p tw="text-xl font-semibold">
        {tokens.other.symbol} / {tokens.denom.symbol}
      </p>

      {priceChange.greaterThan(0) ? (
        <p tw="text-green-500">+{priceChange.toFixed(2)}%</p>
      ) : (
        <p tw="text-red">{priceChange.toFixed(2)}%</p>
      )}
    </div>
  );
};
