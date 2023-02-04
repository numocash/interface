import { Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";

import {
  useCurrentPrice,
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useExternalExchange";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { TokenIcon } from "../../common/TokenIcon";
import { Times } from "../TradeDetails/TimeSelector";
import { MiniChart } from "./MiniChart";

interface Props {
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo];
}

export const MarketItem: React.FC<Props> = ({ tokens }: Props) => {
  const referenceMarketQuery = useMostLiquidMarket(tokens);

  const invertPriceQuery = tokens[1].sortsBefore(tokens[0]);

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data,
    Times.ONE_DAY
  );

  const priceHistory = useMemo(() => {
    if (!priceHistoryQuery.data) return null;
    return invertPriceQuery
      ? priceHistoryQuery.data.map((p) => ({
          ...p,
          price: p.price.invert(),
        }))
      : priceHistoryQuery.data;
  }, [invertPriceQuery, priceHistoryQuery.data]);

  const currentPriceQuery = useCurrentPrice(referenceMarketQuery.data);

  const currentPrice = useMemo(() => {
    if (!currentPriceQuery.data) return null;
    return invertPriceQuery
      ? currentPriceQuery.data.invert()
      : currentPriceQuery.data;
  }, [currentPriceQuery.data, invertPriceQuery]);

  const priceChange = useMemo(() => {
    if (!currentPrice || !priceHistory) return null;

    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    const f = currentPrice.subtract(oneDayOldPrice).divide(oneDayOldPrice);

    return new Percent(f.numerator, f.denominator);
  }, [currentPrice, priceHistory]);

  // return null;
  const loading = !priceHistory || !currentPrice || !priceChange;

  return loading ? (
    <div tw="w-full h-14 duration-300 animate-pulse bg-gray-300 rounded-xl" />
  ) : (
    <NavLink
      tw=""
      to={`/trade/details/${tokens[0].address}/${tokens[1].address}`}
    >
      <div tw="w-full rounded-xl hover:bg-gray-200 transform ease-in-out duration-1000 grid grid-cols-5 px-6 h-14 items-center justify-between">
        <div tw="flex items-center gap-3 col-span-2">
          <div tw="flex items-center space-x-[-0.5rem] rounded-lg bg-gray-200 px-2 py-1">
            <TokenIcon token={tokens[1]} size={32} />
            <TokenIcon token={tokens[0]} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold text-lg text-default leading-tight">
              {tokens[1].symbol} / {tokens[0].symbol}
            </span>
          </div>
        </div>

        <MiniChart priceHistory={priceHistory} currentPrice={currentPrice} />

        <div tw="text-lg font-semibold justify-self-end">
          {priceChange.greaterThan(0) ? (
            <p tw="text-green-500 ">+{priceChange.toFixed(2)}%</p>
          ) : (
            <p tw="text-red">{priceChange.toFixed(2)}%</p>
          )}
        </div>
      </div>
    </NavLink>
  );
};
