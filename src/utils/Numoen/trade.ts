import type {
  IMarket,
  IMarketInfo,
  IPairInfo,
} from "@dahlia-labs/numoen-utils";
import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, Percent, TokenAmount } from "@dahlia-labs/token-utils";

import type { ISettings } from "../../contexts/settings";
import {
  convertShareToLiquidity,
  liquidityToSpeculative,
  speculativeToLiquidity,
} from "./lendgineMath";

export const outputAmount = (
  market: IMarket,
  marketInfo: IMarketInfo,
  pairInfo: IPairInfo,
  inputAmount: TokenAmount,
  price: Price,
  referenceMarket: [TokenAmount, TokenAmount],
  settings: ISettings
): TokenAmount => {
  if (inputAmount.token === market.pair.speculativeToken) {
    const borrowAmount = determineBorrowAmount(
      inputAmount,
      market,
      price,
      settings.maxSlippagePercent
    );
    // MINT
    const lpAmount = speculativeToLiquidity(
      inputAmount.add(borrowAmount),
      market
    );

    return marketInfo.totalLiquidityBorrowed.equalTo(0)
      ? new TokenAmount(market.token, lpAmount.raw)
      : new TokenAmount(
          market.token,
          lpAmount.scale(
            marketInfo.totalSupply.divide(marketInfo.totalLiquidityBorrowed)
          ).raw
        );
  } else {
    // BURN
    if (pairInfo.totalLPSupply.equalTo(0))
      return new TokenAmount(market.pair.speculativeToken, 0);
    const lpAmount = convertShareToLiquidity(inputAmount, market, marketInfo);
    const speculativeAmount = liquidityToSpeculative(lpAmount, market);
    const r0 = pairInfo.baseAmount.scale(
      lpAmount.divide(pairInfo.totalLPSupply)
    );
    const r1 = pairInfo.speculativeAmount.scale(
      lpAmount.divide(pairInfo.totalLPSupply)
    );
    const repayAmount = determineRepayAmount(
      r0,
      r1,
      referenceMarket[0],
      referenceMarket[1]
    );
    return new TokenAmount(
      market.pair.speculativeToken,
      speculativeAmount.raw
    ).subtract(repayAmount);
  }
};

export const determineBorrowAmount = (
  inputAmount: TokenAmount,
  market: IMarket,
  price: Price,
  slippageBps: Percent
) => {
  const a = market.pair.bound.asFraction.multiply(2);
  const b = price.asFraction.multiply(
    Percent.ONE_HUNDRED.subtract(slippageBps)
  );
  const c = market.pair.bound.subtract(price).multiply(2);

  const numerator = inputAmount.scale(b.add(c));
  const denominator = a.subtract(b).subtract(c);

  const s = new Fraction(10 ** 9);

  return numerator.scale(denominator.invert()).scale(s.invert()).scale(s);
};

export const determineSlippage = (
  inputAmount: TokenAmount,
  u0: TokenAmount,
  u1: TokenAmount
): Percent => {
  if (inputAmount.equalTo(0)) return new Percent(0);
  // always going from base to speculative
  const prePrice = new Fraction(u1.raw, u0.raw);

  const amountInWithFee = inputAmount.multiply(new Fraction(997));
  const numerator = amountInWithFee.multiply(u1);
  const denominator = amountInWithFee.asFraction.add(
    u0.multiply(new Fraction(1000))
  );
  const amountOut = numerator.divide(denominator);

  const postPrice = amountOut.divide(inputAmount);

  return Percent.fromFraction(prePrice.subtract(postPrice).divide(prePrice));
};

export const determineRepayAmount = (
  r0: TokenAmount,
  r1: TokenAmount,
  u0: TokenAmount,
  u1: TokenAmount
) => {
  const a = u1.scale(u0).scale(new Fraction(1000));
  const b = u0.subtract(r0);
  const c = r1.scale(new Fraction(1000));
  const d = u1.scale(new Fraction(1000));

  return a
    .scale(b.invert())
    .add(c)
    .subtract(d)
    .scale(new Fraction(997).invert());
};
