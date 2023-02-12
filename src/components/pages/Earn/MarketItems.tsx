import { Fraction, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";

import { useLendgines } from "../../../hooks/useLendgine";
import type { Market } from "../../../hooks/useMarket";
import { useMarketToLendgines } from "../../../hooks/useMarket";
import { supplyRate } from "../../../utils/Numoen/jumprate";
import { convertPriceToLiquidityPrice } from "../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../utils/Numoen/price";
import { scale } from "../../../utils/Numoen/trade";
import { RowBetween } from "../../common/RowBetween";
import { TokenIcon } from "../../common/TokenIcon";

interface Props {
  market: Market;
}

export const MarketItem: React.FC<Props> = ({ market }: Props) => {
  const lendgines = useMarketToLendgines(market);

  const lendgineInfosQuery = useLendgines(lendgines);

  const { bestSupplyRate, tvl } = useMemo(() => {
    if (!lendgineInfosQuery.data || lendgineInfosQuery.isLoading) return {};

    const supplyRates = lendgineInfosQuery.data.map((l) =>
      supplyRate(l.totalLiquidity, l.totalLiquidityBorrowed)
    );

    const bestSupplyRate = supplyRates.reduce(
      (acc, cur) => (cur.greaterThan(acc) ? cur : acc),
      new Percent(0)
    );

    const tvl = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);
      // token0 / liq
      const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

      const liquidity = cur.totalLiquidity.add(cur.totalLiquidityBorrowed);

      const liquidityValue = liquidity.multiply(liquidityPrice).divide(scale);
      return (
        lendgine.token0.equals(market[0])
          ? liquidityValue
          : liquidityValue.divide(price)
      ).add(acc);
    }, new Fraction(0));
    return { bestSupplyRate, tvl };
  }, [
    lendgineInfosQuery.data,
    lendgineInfosQuery.isLoading,
    lendgines,
    market,
  ]);
  return (
    <NavLink
      tw=""
      to={`/earn/details/${market[0].address}/${market[1].address}`}
    >
      <Wrapper hasDeposit={false}>
        <div tw="py-2 px-4 gap-4 flex flex-col bg-white rounded-t-xl">
          <div tw="flex items-center gap-3 col-span-2">
            <div tw="flex items-center space-x-[-0.5rem] rounded-lg bg-gray-200 px-2 py-1">
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
                bestSupplyRate.toFixed(1) + "%"
              ) : (
                <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-6 w-12" />
              )}
            </p>
          </div>

          <div tw="flex flex-col">
            <p tw="text-sm text-secondary">TVL</p>
            <p tw="text-default font-bold">
              {tvl ? (
                <p>
                  {tvl.toSignificant(5)} {market[0].symbol}
                </p>
              ) : (
                <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-6 w-20" />
              )}
            </p>
          </div>
        </div>
        <div tw="bg-gray-200 w-full overflow-hidden">
          <RowBetween tw="items-center bg-transparent">
            <p>Your position</p>
            <p>--</p>
          </RowBetween>
        </div>
      </Wrapper>
    </NavLink>
  );
};

interface WrapperProps {
  hasDeposit: boolean;

  children?: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({
  hasDeposit,
  children,
}: WrapperProps) => {
  return hasDeposit ? (
    <div tw="border-t-2 border-black rounded-xl transform ease-in-out hover:scale-110 duration-300">
      <div tw="rounded-xl w-full border-2 bg-gray-200 border-t-0">
        {children}
      </div>
    </div>
  ) : (
    <div tw="rounded-xl w-full border-2  transform ease-in-out hover:scale-110 duration-300 bg-gray-200">
      {children}
    </div>
  );
};
