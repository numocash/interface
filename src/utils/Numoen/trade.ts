import type { CurrencyAmount, Percent, Price } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import type { Lendgine, LendgineInfo } from "../../constants/types";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { liquidityPerCollateral } from "./lendgineMath";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const determineBorrowAmount = (
  userAmount: CurrencyAmount<WrappedTokenInfo>,
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<Lendgine>,
  referencePrice: Price<WrappedTokenInfo, WrappedTokenInfo>,
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

  const expectedSwapOutput = referencePrice
    .invert()
    .quote(token0Amount)
    .multiply(ONE_HUNDRED_PERCENT.subtract(slippageBps));

  const userLiquidityValue = userAmount.subtract(
    token1Amount.add(expectedSwapOutput)
  );

  const multiple = userAmount.divide(userLiquidityValue).asFraction;

  return userAmount.multiply(multiple.subtract(1));
};
