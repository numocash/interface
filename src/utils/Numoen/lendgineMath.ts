import type { Price } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";

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

export const convertPriceToLiquidityPrice = (
  price: Price<WrappedTokenInfo, WrappedTokenInfo>,
  lendgine: Lendgine
) => {
  return price.asFraction
    .multiply(lendgine.bound)
    .multiply(2)
    .subtract(price.asFraction.multiply(price));
};
