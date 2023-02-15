import { CurrencyAmount, Price } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";

export const convertLiquidityToShare = <L extends Lendgine>(
  liquidity: CurrencyAmount<L["liquidity"]>,
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  if (lendgineInfo.totalLiquidityBorrowed.equalTo(0))
    return CurrencyAmount.fromRawAmount(lendgine.lendgine, 0);
  return liquidity.multiply(
    lendgineInfo.totalSupply.divide(lendgineInfo.totalLiquidityBorrowed)
  );
};

export const convertShareToLiquidity = <L extends Lendgine>(
  shares: CurrencyAmount<L["lendgine"]>,
  lendgineInfo: LendgineInfo<L>
) => {
  return lendgineInfo.totalLiquidityBorrowed
    .multiply(shares)
    .divide(lendgineInfo.totalSupply);
};

export const convertCollateralToLiquidity = <L extends Lendgine>(
  collateral: CurrencyAmount<L["token1"]>,
  lendgine: L
) => {
  const f = collateral.divide(lendgine.bound.asFraction.multiply(2));
  return CurrencyAmount.fromFractionalAmount(
    lendgine.liquidity,
    f.numerator,
    f.denominator
  );
};

export const convertLiquidityToCollateral = <L extends Lendgine>(
  liquidity: CurrencyAmount<L["liquidity"]>,
  lendgine: L
) => {
  const f = liquidity.multiply(lendgine.bound.asFraction.multiply(2));
  return CurrencyAmount.fromFractionalAmount(
    lendgine.token1,
    f.numerator,
    f.denominator
  );
};

export const liquidityPerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const liquidity = convertShareToLiquidity(
    CurrencyAmount.fromRawAmount(lendgine.lendgine, 1),
    lendgineInfo
  );

  return new Price(
    lendgine.lendgine,
    lendgine.liquidity,
    liquidity.denominator,
    liquidity.numerator
  );
};

export const liquidityPerCollateral = <L extends Lendgine>(lendgine: L) => {
  const liquidity = convertCollateralToLiquidity(
    CurrencyAmount.fromRawAmount(lendgine.token1, 1),
    lendgine
  );

  return new Price(
    lendgine.token1,
    lendgine.liquidity,
    liquidity.denominator,
    liquidity.numerator
  );
};
