import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useLendgines } from "../../../hooks/useLendgines";
import { useLendginesPositions } from "../../../hooks/useLendginesPositions";
import { useMarketToLendgines } from "../../../hooks/useMarket";
import { supplyRate } from "../../../lib/jumprate";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerPosition,
} from "../../../lib/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../lib/price";
import type { Market } from "../../../lib/types/market";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { formatPercent } from "../../../utils/format";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { TokenIcon } from "../../common/TokenIcon";

interface Props {
  market: Market;
}

export const MarketItem: React.FC<Props> = ({ market }: Props) => {
  const lendgines = useMarketToLendgines(market);
  const { address } = useAccount();
  const t = getT();

  const positions = useLendginesPositions(lendgines, address);
  const lendgineInfosQuery = useLendgines(lendgines);

  const positionValue = useMemo(() => {
    if (
      positions.isLoading ||
      lendgineInfosQuery.isLoading ||
      !positions.data ||
      !lendgineInfosQuery.data ||
      !lendgines
    )
      return null;

    return positions.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      const lendgineInfo = lendgineInfosQuery.data?.[i];
      invariant(lendgine && lendgineInfo);
      const price = numoenPrice(lendgine, lendgineInfo);
      const liquidityPrice = pricePerLiquidity({ lendgine, lendgineInfo });

      const liqPerPosition = liquidityPerPosition(lendgine, lendgineInfo);

      const liquidity = liqPerPosition.quote(cur.size);
      const value = liquidityPrice.quote(liquidity);
      return acc.add(
        market[0].equals(lendgine.token0) ? value : invert(price).quote(value)
      );
    }, CurrencyAmount.fromRawAmount(market[0], 0));
  }, [
    lendgineInfosQuery.data,
    lendgineInfosQuery.isLoading,
    lendgines,
    market,
    positions.data,
    positions.isLoading,
  ]);

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
      <Wrapper positionValue={positionValue}>
        <div tw="flex items-center gap-3 col-span-2">
          <div tw="flex items-center space-x-[-0.5rem] rounded-lg bg-secondary px-2 py-1">
            <TokenIcon token={market[1]} size={32} />
            <TokenIcon token={market[0]} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold text-lg text-default leading-tight">
              {market[1].symbol} / {market[0].symbol}
            </span>
          </div>
        </div>

        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">Best APR</p>
          <p tw="text-default font-bold">
            {bestSupplyRate ? (
              formatPercent(bestSupplyRate)
            ) : (
              <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-secondary h-6 w-12" />
            )}
          </p>
        </div>

        <div tw="flex flex-col">
          <p tw="text-sm text-secondary">TVL</p>
          <p tw="text-default font-bold">
            {tvl ? (
              <TokenAmountDisplay amount={tvl} showSymbol />
            ) : (
              <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-secondary h-6 w-20" />
            )}
          </p>
        </div>
      </Wrapper>
    </NavLink>
  );
};

interface WrapperProps {
  positionValue: CurrencyAmount<WrappedTokenInfo> | null;

  children?: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({
  positionValue,
  children,
}: WrapperProps) => {
  return positionValue?.greaterThan(0) ? (
    <div tw="rounded-xl w-full border-2  border-secondary  ease-in-out sm:hover:scale-105 duration-300 bg-secondary">
      <div tw="py-2 px-4 gap-4 flex flex-col bg-background rounded-t-xl">
        {children}
      </div>
      <div tw="w-full overflow-hidden">
        <RowBetween tw="items-center bg-transparent">
          <p>Your position</p>
          <TokenAmountDisplay amount={positionValue} showSymbol />
        </RowBetween>
      </div>
    </div>
  ) : (
    <div tw="rounded-xl w-full border-2 border-secondary transform ease-in-out sm:hover:scale-105 duration-300 flex py-2 px-4 gap-4 flex-col">
      {children}
    </div>
  );
};
