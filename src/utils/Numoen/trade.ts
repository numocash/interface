import type { CurrencyAmount, Percent, Price } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import type { Lendgine, LendgineInfo } from "../../constants/types";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { liquidityPerCollateral } from "./lendgineMath";
import { numoenPrice, priceToReserves } from "./price";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

// TODO: decimal error here
export const determineBorrowAmount = (
  userAmount: CurrencyAmount<WrappedTokenInfo>,
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<Lendgine>,
  referencePrice: Price<WrappedTokenInfo, WrappedTokenInfo>,
  slippageBps: Percent
) => {
  const liqPerCol = liquidityPerCollateral(lendgine);
  const userLiquidity = liqPerCol.quote(userAmount);
  const price = numoenPrice(lendgine, lendgineInfo);

  const { token0Amount, token1Amount } = priceToReserves(lendgine, price);
  const expectedSwapOutput = referencePrice
    .invert()
    .quote(token0Amount.quote(userLiquidity))
    .multiply(ONE_HUNDRED_PERCENT.subtract(slippageBps));
  // TODO: problem here on inverse markets

  const userLiquidityValue = userAmount.subtract(
    token1Amount.quote(userLiquidity).add(expectedSwapOutput)
  );

  const multiple = userAmount.divide(
    userAmount.subtract(userLiquidityValue)
  ).asFraction;

  return userAmount.multiply(multiple);
};
