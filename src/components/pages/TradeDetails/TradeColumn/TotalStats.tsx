import { Fraction } from "@uniswap/sdk-core";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { useLendgines } from "../../../../hooks/useLendgine";
import {
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
} from "../../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../../utils/Numoen/price";
import { scale } from "../../../../utils/Numoen/trade";
import { VerticalItem } from "../../../common/VerticalItem";
import { useTradeDetails } from "..";

export const TotalStats: React.FC = () => {
  const { base, lendgines } = useTradeDetails();

  const lendgineInfosQuery = useLendgines(lendgines);

  const { openInterest, tvl } = useMemo(() => {
    if (lendgineInfosQuery.isLoading || !lendgineInfosQuery.data) return {};

    const openInterest = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);
      // token0 / liq
      const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

      const liquidity = cur.totalLiquidityBorrowed;

      const liquidityValue = liquidity.multiply(liquidityPrice).divide(scale);
      return (
        lendgine.token0.equals(base)
          ? liquidityValue
          : liquidityValue.divide(price)
      ).add(acc);
    }, new Fraction(0));

    const tvl = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);
      // token0 / liq
      const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

      // token1
      const collateral = convertLiquidityToCollateral(
        cur.totalLiquidityBorrowed,
        lendgine
      );

      const liquidity = cur.totalLiquidity.add(cur.totalLiquidityBorrowed);

      // token0
      const liquidityValue = liquidity.multiply(liquidityPrice).divide(scale);
      const collateralValue = collateral.multiply(price).divide(scale);
      return (
        lendgine.token0.equals(base)
          ? liquidityValue.add(collateralValue)
          : liquidityValue.add(collateralValue).divide(price)
      ).add(acc);
    }, new Fraction(0));

    return { openInterest, tvl };
  }, [base, lendgineInfosQuery.data, lendgineInfosQuery.isLoading, lendgines]);

  return (
    <div tw="flex justify-around w-full">
      <VerticalItem
        tw="items-center"
        label="Open interest"
        item={
          !openInterest ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-8 w-20" />
          ) : (
            <>
              {openInterest.toSignificant(5)}{" "}
              <span tw="text-xs font-normal">{base.symbol}</span>
            </>
          )
        }
      />
      <VerticalItem
        tw="items-center"
        label="Total value locked"
        item={
          !tvl ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-8 w-20" />
          ) : (
            <>
              {tvl.toSignificant(5)}{" "}
              <span tw="text-xs font-normal">{base.symbol}</span>
            </>
          )
        }
      />
    </div>
  );
};
