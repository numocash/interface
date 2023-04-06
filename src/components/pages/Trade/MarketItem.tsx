import { Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";

import {
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useExternalExchange";
import { priceToFraction } from "../../../lib/price";
import type { Market } from "../../../lib/types/market";
import { formatPercent } from "../../../utils/format";
import { TokenIcon } from "../../common/TokenIcon";
import { MiniChart } from "./MiniChart";

interface Props {
  market: Market;
}

export const MarketItem: React.FC<Props> = ({ market }: Props) => {
  const priceQuery = useMostLiquidMarket(market);

  const invertPriceQuery = market.base.sortsBefore(market.quote);

  const priceHistoryQuery = usePriceHistory(
    market,
    priceQuery.data?.pool,
    "ONE_DAY"
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

  const priceChange = useMemo(() => {
    if (!priceQuery.data || !priceHistory) return null;

    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    const f = priceToFraction(priceQuery.data.price)
      .subtract(oneDayOldPrice)
      .divide(oneDayOldPrice);

    return new Percent(f.numerator, f.denominator);
  }, [priceHistory, priceQuery.data]);

  return (
    <NavLink
      tw=""
      to={`/trade/details/${market.base.address}/${market.quote.address}`}
    >
      <div tw="w-full rounded-xl sm:hover:scale-102 transform ease-in-out duration-300 grid grid-cols-3 md:grid-cols-5  h-16 items-center justify-between  bg-white border border-[#dfdfdf] shadow px-6 ">
        <div tw="flex items-center gap-3 col-span-2">
          <div tw="flex items-center space-x-[-0.5rem] ">
            <TokenIcon token={market.base} size={32} />
            <TokenIcon token={market.quote} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold sm:text-xl text-default leading-tight">
              {market.base.symbol} / {market.quote.symbol}
            </span>
          </div>
        </div>

        {!!priceHistory && !!priceQuery.data ? (
          <MiniChart
            priceHistory={priceHistory}
            currentPrice={priceQuery.data.price}
          />
        ) : (
          <div tw="rounded-lg h-10 w-32 animate-pulse transform ease-in-out duration-300 bg-gray-100 justify-self-center hidden md:(flex col-span-2)" />
        )}

        {priceChange ? (
          <div tw="sm:(text-lg font-semibold) justify-self-end">
            {priceChange.greaterThan(0) ? (
              <p tw="text-green ">+{formatPercent(priceChange)}</p>
            ) : (
              <p tw="text-red">{formatPercent(priceChange)}</p>
            )}
          </div>
        ) : (
          <div tw="justify-self-end h-6 rounded-lg bg-gray-100 w-16 transform animate-pulse ease-in-out duration-300" />
        )}
      </div>
    </NavLink>
  );
};
