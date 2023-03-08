import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { useLendgines } from "../../../../hooks/useLendgine";
import { liquidityPerCollateral } from "../../../../utils/Numoen/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerLiquidity,
} from "../../../../utils/Numoen/price";
import { TokenAmountDisplay } from "../../../common/TokenAmountDisplay";
import { VerticalItem } from "../../../common/VerticalItem";
import { useTradeDetails } from "../TradeDetailsInner";

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
      const liquidityPrice = pricePerLiquidity({ lendgine, price });

      const liquidity = cur.totalLiquidityBorrowed;

      // token0
      const liquidityValue = liquidityPrice.quote(liquidity);

      return (
        lendgine.token0.equals(base)
          ? liquidityValue
          : invert(price).quote(liquidityValue)
      ).add(acc);
    }, CurrencyAmount.fromRawAmount(base, 0));

    const tvl = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);
      // liq / token1
      const liqPerCol = liquidityPerCollateral(lendgine);

      // token0 / liq
      const liquidityPrice = pricePerLiquidity({ lendgine, price });

      // token1
      const collateral = liqPerCol.invert().quote(cur.totalLiquidityBorrowed);

      const liquidity = cur.totalLiquidity.add(cur.totalLiquidityBorrowed);

      // token0
      const liquidityValue = liquidityPrice.quote(liquidity);
      const collateralValue = price.quote(collateral);
      return (
        lendgine.token0.equals(base)
          ? liquidityValue.add(collateralValue)
          : invert(price).quote(liquidityValue.add(collateralValue))
      ).add(acc);
    }, CurrencyAmount.fromRawAmount(base, 0));

    return { openInterest, tvl };
  }, [base, lendgineInfosQuery.data, lendgineInfosQuery.isLoading, lendgines]);

  return (
    <div tw="flex justify-around w-full">
      <VerticalItem
        tw="items-center"
        label="Open interest"
        item={
          !openInterest ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-secondary h-8 w-20" />
          ) : (
            <TokenAmountDisplay amount={openInterest} showSymbol />
          )
        }
      />
      <VerticalItem
        tw="items-center"
        label="Total value locked"
        item={
          !tvl ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-secondary h-8 w-20" />
          ) : (
            <TokenAmountDisplay amount={tvl} showSymbol />
          )
        }
      />
    </div>
  );
};
