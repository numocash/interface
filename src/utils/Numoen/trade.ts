import type { CurrencyAmount, Percent, Price } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import type { Lendgine } from "../../constants";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const determineBorrowAmount = (
  userAmount: CurrencyAmount<WrappedTokenInfo>,
  lendgine: Lendgine,
  price: Price<WrappedTokenInfo, WrappedTokenInfo>,
  slippageBps: Percent
) => {
  // TODO: use a better slippage predictor
  const a = lendgine.bound.asFraction.multiply(2);
  const b = price.asFraction.multiply(
    ONE_HUNDRED_PERCENT.subtract(slippageBps)
  );
  const c = lendgine.bound.subtract(price.asFraction).multiply(2);

  const numerator = userAmount.multiply(b.add(c));
  const denominator = a.subtract(b).subtract(c);

  return numerator.multiply(denominator.invert());
};
