import { Fraction, Price } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";

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

// // returns price in token0 / share
// export const pricePerShare = <L extends Lendgine>(
//   lendgine: L,
//   lendgineInfo: LendgineInfo<L>
// ): Price<L["lendgine"], L["token0"]> => {
//   if (lendgineInfo.totalLiquidity.equalTo(0))
//     return new Price(lendgine.lendgine, lendgine.token0, 1, 0);

//   // token0 / token1
//   const price = numoenPrice(lendgine, lendgineInfo);

//   // token0 / liq
//   const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);

//   // share / liq
//   const sharePerLiq = new Price(lendgine.liquidity, lendgine.lendgine, )

//   const liquidity = convertShareToLiquidity(
//     CurrencyAmount.fromFractionalAmount(lendgine.lendgine, 1, 1),
//     lendgineInfo
//   );
//   const collateral = convertLiquidityToCollateral(liquidity, lendgine);

//   // token0
//   const collateralValue = price.quote(collateral);
//   const liquidityValue = liquidityPrice.quote(liquidity);

//   return collateralValue.subtract(liquidityValue);
// };

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
