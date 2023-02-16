import { Fraction, Price } from "@uniswap/sdk-core";

import type { Lendgine, LendgineInfo } from "../../constants/types";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { liquidityPerCollateral } from "./lendgineMath";

// returns price in token0 / token1
export const numoenPrice = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
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

// The value of one nondiluted share of collateral in terms of token0
export const pricePerCollateral = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const price = numoenPrice(lendgine, lendgineInfo);

  return liquidityPerCollateral(lendgine).invert().multiply(price);
};

// The value of one nondiluted share of liquidity in terms of token0
export const pricePerLiquidity = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const price = numoenPrice(lendgine, lendgineInfo);

  const f = lendgine.bound.asFraction
    .multiply(price)
    .multiply(2)
    .subtract(price.asFraction.multiply(price));

  return new Price(
    lendgine.lendgine,
    lendgine.token0,
    f.denominator,
    f.numerator
  );
};

// The value of one nondiluted share in terms of token0
export const pricePerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const f = pricePerCollateral(lendgine, lendgineInfo).subtract(
    pricePerLiquidity(lendgine, lendgineInfo)
  );
  return new Price(
    lendgine.lendgine,
    lendgine.token0,
    f.denominator,
    f.numerator
  );
};

export const lvrCoef = (
  price: Price<WrappedTokenInfo, WrappedTokenInfo>,
  lendgine: Lendgine
) => {
  if (price.greaterThan(lendgine.bound)) return new Fraction(0);
  const numerator = price.asFraction.multiply(price.asFraction);
  const denominator = price.asFraction
    .multiply(lendgine.bound.asFraction)
    .multiply(2)
    .subtract(numerator);
  return numerator.divide(denominator);
};
