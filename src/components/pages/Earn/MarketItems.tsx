import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";

import { useLendgines } from "../../../hooks/useLendgines";
import { useMarketToLendgines } from "../../../hooks/useMarket";
import { supplyRate } from "../../../lib/jumprate";
import { accruedLendgineInfo, getT } from "../../../lib/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../lib/price";
import type { Market } from "../../../lib/types/market";
import { formatPercent } from "../../../utils/format";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { TokenIcon } from "../../common/TokenIcon";

interface Props {
  market: Market;
}

export const MarketItem: React.FC<Props> = ({ market }: Props) => {
  const lendgines = useMarketToLendgines(market);
  const t = getT();

  const lendgineInfosQuery = useLendgines(lendgines);

  const { bestSupplyRate, tvl } = useMemo(() => {
    if (!lendgineInfosQuery.data || lendgineInfosQuery.isLoading || !lendgines)
      return {};

    const bestSupplyRate = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      const updatedInfo = accruedLendgineInfo(lendgine, cur, t);

      // token0 / liq
      const liquidityPrice = pricePerLiquidity({
        lendgine,
        lendgineInfo: updatedInfo,
      });

      // col / liq
      const collateralPrice = pricePerCollateral(lendgine, updatedInfo);

      const interestPremium = collateralPrice
        .subtract(liquidityPrice)
        .divide(liquidityPrice);

      const rate = supplyRate(updatedInfo).multiply(interestPremium);
      return rate.greaterThan(acc) ? rate : acc;
    }, new Percent(0));

    const tvl = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines?.[i];
      invariant(lendgine);

      // liq
      const liquidity = cur.totalLiquidity.add(cur.totalLiquidityBorrowed);

      // token0 / token1
      const price = numoenPrice(lendgine, cur);

      // token0 / liq
      const liquidityPrice = pricePerLiquidity({ lendgine, lendgineInfo: cur });

      // token0
      const liquidityValue = liquidityPrice.quote(liquidity);

      return (
        lendgine.token0.equals(market[0])
          ? liquidityValue
          : invert(price).quote(liquidityValue)
      ).add(acc);
    }, CurrencyAmount.fromRawAmount(market[0], 0));
    return { bestSupplyRate, tvl };
  }, [
    lendgineInfosQuery.data,
    lendgineInfosQuery.isLoading,
    lendgines,
    market,
    t,
  ]);

  return (
    <NavLink
      tw=""
      to={`/earn/details/${market[0].address}/${market[1].address}`}
    >
      <Wrapper>
        <div tw="flex items-center gap-3 col-span-2">
          <div tw="flex items-center space-x-[-0.5rem]">
            <TokenIcon token={market[1]} size={32} />
            <TokenIcon token={market[0]} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold text-xl text-default leading-tight">
              {market[1].symbol} / {market[0].symbol}
            </span>
          </div>
        </div>

        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">Best APR</p>
          <p tw="text-default font-bold text-lg">
            {bestSupplyRate ? (
              formatPercent(bestSupplyRate)
            ) : (
              <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-6 w-12" />
            )}
          </p>
        </div>

        <div tw="flex flex-col">
          <p tw="text-sm text-secondary">TVL</p>
          <p tw="text-default font-bold text-lg">
            {tvl ? (
              <TokenAmountDisplay amount={tvl} showSymbol />
            ) : (
              <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-6 w-20" />
            )}
          </p>
        </div>
      </Wrapper>
    </NavLink>
  );
};

interface WrapperProps {
  children?: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }: WrapperProps) => {
  return (
    <div tw="rounded-xl w-full border border-gray-100 bg-white shadow transform ease-in-out sm:hover:scale-105 duration-300 flex py-2 px-4 gap-4 flex-col">
      {children}
    </div>
  );
};
