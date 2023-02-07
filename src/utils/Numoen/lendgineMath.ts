import { Fraction } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";

export const convertLiquidityToShare = (
  liquidity: Fraction,
  lendgineInfo: LendgineInfo
) => {
  if (lendgineInfo.totalLiquidityBorrowed.equalTo(0)) return new Fraction(0);
  return liquidity.multiply(
    lendgineInfo.totalSupply.divide(lendgineInfo.totalLiquidityBorrowed)
  );
};

export const convertShareToLiquidity = (
  shares: Fraction,
  lendgineInfo: LendgineInfo
) => {
  return lendgineInfo.totalLiquidityBorrowed
    .multiply(shares)
    .divide(lendgineInfo.totalSupply);
};

export const convertCollateralToLiquidity = (
  collateral: Fraction,
  lendgine: Lendgine
) => {
  return collateral.divide(lendgine.bound.asFraction.multiply(2));
};

export const convertLiquidityToCollateral = (
  liquidity: Fraction,
  lendgine: Lendgine
) => {
  return liquidity.multiply(lendgine.bound.asFraction.multiply(2));
};
