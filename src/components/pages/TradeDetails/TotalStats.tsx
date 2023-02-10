import { Fraction } from "@uniswap/sdk-core";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import tw, { styled } from "twin.macro";

import { useLendgines } from "../../../hooks/useLendgine";
import {
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
} from "../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../utils/Numoen/price";
import { scale } from "../../../utils/Numoen/trade";
import { VerticalItem } from "../../common/VerticalItem";
import { useTradeDetails } from ".";

export const TotalStats: React.FC = () => {
  const { base, lendgines } = useTradeDetails();

  const lendgineInfo = useLendgines(lendgines);

  const { openInterest, tvl } = useMemo(() => {
    if (lendgineInfo.isLoading || !lendgineInfo.data) return {};
    const openInterest = lendgineInfo.data.reduce((acc: Fraction, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);

      const isInverse = lendgine.token1.equals(base);

      const price = numoenPrice(lendgine, cur);
      const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

      const borrowedValue = liquidityPrice
        .multiply(cur.totalLiquidityBorrowed)
        .divide(scale);

      return (
        isInverse ? borrowedValue.multiply(price).divide(scale) : borrowedValue
      ).add(acc);
    }, new Fraction(0));

    const tvl = lendgineInfo.data.reduce((acc: Fraction, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);

      const isInverse = lendgine.token1.equals(base);

      const price = numoenPrice(lendgine, cur);
      const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

      const totalCollateral = convertLiquidityToCollateral(
        cur.totalLiquidityBorrowed,
        lendgine
      );

      const collateralValue = totalCollateral.multiply(price).divide(scale);
      const liquidityValue = cur.totalLiquidity
        .multiply(liquidityPrice)
        .divide(scale);

      const totalValue = collateralValue.add(liquidityValue);

      return (
        isInverse ? totalValue.multiply(price).divide(scale) : totalValue
      ).add(acc);
    }, new Fraction(0));

    return { openInterest, tvl };
  }, [base, lendgineInfo.data, lendgineInfo.isLoading, lendgines]);

  return (
    <div tw="flex justify-around w-full">
      <VerticalItem
        tw="items-center"
        label="Open interest"
        item={
          !openInterest ? (
            <Loading />
          ) : (
            <p>
              {openInterest.toSignificant(5)}{" "}
              <span tw="text-xs font-normal">{base.symbol}</span>
            </p>
          )
        }
      />
      <VerticalItem
        tw="items-center"
        label="Total value locked"
        item={
          !tvl ? (
            <Loading />
          ) : (
            <p>
              {tvl.toSignificant(5)}{" "}
              <span tw="text-xs font-normal">{base.symbol}</span>
            </p>
          )
        }
      />
    </div>
  );
};

const Loading = styled.div(() => [
  tw`h-6 duration-300 ease-in-out transform rounded-lg w-14 animate-pulse`,
]);
