import type { CurrencyAmount, Price } from "@uniswap/sdk-core";
import { Fraction, Percent } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import type { Lendgine, LendgineInfo } from "../../constants/types";
import { isV3 } from "../../hooks/useExternalExchange";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import type { UniswapV2Pool } from "../../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../../services/graphql/uniswapV3";
import { liquidityPerCollateral } from "./lendgineMath";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const determineBorrowAmount = (
  userAmount: CurrencyAmount<WrappedTokenInfo>,
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<Lendgine>,
  referenceMarket: {
    pool: UniswapV2Pool | UniswapV3Pool;
    price: Price<WrappedTokenInfo, WrappedTokenInfo>;
  },
  slippageBps: Percent
) => {
  const liqPerCol = liquidityPerCollateral(lendgine);
  const userLiquidity = liqPerCol.quote(userAmount);

  const token0Amount = lendgineInfo.reserve0
    .multiply(userLiquidity)
    .divide(lendgineInfo.totalLiquidity);

  const token1Amount = lendgineInfo.reserve1
    .multiply(userLiquidity)
    .divide(lendgineInfo.totalLiquidity);

  // token0 / token1
  const referencePrice = lendgine.token0.equals(
    referenceMarket.price.quoteCurrency
  )
    ? referenceMarket.price
    : referenceMarket.price.invert();

  const dexFee = isV3(referenceMarket.pool)
    ? new Percent(referenceMarket.pool.feeTier, "1000000")
    : new Percent("3000", "1000000");

  const expectedSwapOutput = referencePrice
    .invert()
    .quote(token0Amount)
    .multiply(ONE_HUNDRED_PERCENT.subtract(dexFee))
    .multiply(ONE_HUNDRED_PERCENT.subtract(slippageBps));

  const userLiquidityValue = userAmount.subtract(
    token1Amount.add(expectedSwapOutput)
  );

  const multiple = userAmount.divide(userLiquidityValue).asFraction;

  return userAmount.multiply(multiple.subtract(1));
};
