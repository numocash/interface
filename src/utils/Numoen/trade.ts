import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Price, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction, Percent } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";

import { getAmountOut } from "./uniPairMath";

export const determineBorrowAmount = (
  inputAmount: TokenAmount,
  market: IMarket,
  price: Price,
  slippageBps: Percent
) => {
  // TODO: use a better slippage perdictor
  const a = market.pair.bound.asFraction.multiply(2);
  const b = price.asFraction.multiply(
    Percent.ONE_HUNDRED.subtract(slippageBps)
  );
  const c = market.pair.bound.subtract(price).multiply(2);

  const numerator = inputAmount.scale(b.add(c));
  const denominator = a.subtract(b).subtract(c);

  return numerator.scale(denominator.invert());
};

export const determineSlippage = (
  inputAmount: TokenAmount,
  u0: TokenAmount,
  u1: TokenAmount
): Percent => {
  if (inputAmount.equalTo(0)) return new Percent(0);
  // always going from base to speculative
  const prePrice = new Fraction(u0.raw, u1.raw); // weth / dpx
  // swap from weth to dpx
  const amountOut = getAmountOut(inputAmount, u1, u0);
  const postPrice = amountOut.divide(inputAmount);

  return Percent.fromFraction(prePrice.subtract(postPrice).divide(prePrice));
};

export const determineRepayAmount = (
  r0: JSBI,
  r1: JSBI,
  u0: JSBI,
  u1: JSBI
) => {
  const thousand = JSBI.BigInt(1000);

  const a = JSBI.multiply(JSBI.multiply(u0, u1), thousand);
  const b = JSBI.subtract(u0, r0);
  const c = JSBI.multiply(r1, thousand);
  const d = JSBI.multiply(u1, thousand);

  return JSBI.add(
    JSBI.divide(
      JSBI.subtract(JSBI.add(JSBI.divide(a, b), c), d),
      JSBI.BigInt(997)
    ),
    JSBI.BigInt(1)
  );
};
