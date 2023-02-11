import { Fraction, Price } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";
import {
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
  convertShareToLiquidity,
} from "./lendgineMath";

// returns price in token0 / token1
export const numoenPrice = (lendgine: Lendgine, lendgineInfo: LendgineInfo) => {
  if (lendgineInfo.totalLiquidity.equalTo(0))
    return new Price(lendgine.token1, lendgine.token0, 1, 0);

  const scale1 = lendgineInfo.reserve1.divide(lendgineInfo.totalLiquidity);
  const priceFraction = lendgine.bound.subtract(scale1.divide(2));

  return new Price(
    lendgine.token1,
    lendgine.token0,
    priceFraction.denominator,
    priceFraction.numerator
  );
};

// returns price in token0 / share
export const pricePerShare = (
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo
) => {
  if (lendgineInfo.totalLiquidity.equalTo(0))
    return new Price(lendgine.token1, lendgine.token0, 1, 0);

  // token0 / token1
  const price = numoenPrice(lendgine, lendgineInfo);

  // token0 / liq
  const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

  const liquidity = convertShareToLiquidity(new Fraction(1), lendgineInfo);
  const collateral = convertLiquidityToCollateral(liquidity, lendgine);

  const collateralValue = collateral.multiply(price);
  const liquidityValue = liquidity.multiply(liquidityPrice);

  return collateralValue.subtract(liquidityValue);
};
