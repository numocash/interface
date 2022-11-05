import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

import { scale } from "../components/pages/Trade/useTrade";
import type { IMarket, IMarketInfo } from "../contexts/environment";

export const outputAmount = (
  market: IMarket,
  marketInfo: IMarketInfo,
  inputAmount: TokenAmount,
  price: Price
): TokenAmount => {
  if (inputAmount.token === market.pair.speculativeToken) {
    const borrowAmount = determineBorrowAmount(inputAmount, market, price, 100);
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
    const lpAmount = !marketInfo.totalSupply.equalTo(0)
      ? inputAmount
          .multiply(marketInfo.totalLiquidityBorrowed)
          .multiply(scale)
          .divide(marketInfo.totalSupply)
      : new Fraction(0);

    return new TokenAmount(
      market.pair.speculativeToken,
      lpAmount
        .multiply(2)
        .multiply(market.pair.bound.asFraction)
        .divide(scale).quotient
    );
  }
};

const determineBorrowAmount = (
  inputAmount: TokenAmount,
  market: IMarket,
  price: Price,
  slippageBps: number
) => {
  const x0 = price.asFraction.multiply(price);
  const x1 = market.pair.bound.subtract(price).multiply(2);

  const numerator = inputAmount
    .scale(x1)
    .add(
      inputAmount
        .scale(x0.divide(price))
        .scale(new Fraction(10000 - slippageBps, 10000))
    );

  const denominator = market.pair.bound.asFraction
    .multiply(2)
    .subtract(
      x0.divide(price).multiply(new Fraction(10000 - slippageBps, 10000))
    )
    .subtract(x1);

  return numerator.scale(denominator.invert());
};

export const speculativeToLiquidity = (
  speculative: TokenAmount,
  market: IMarket
): TokenAmount => {
  return speculative.scale(market.pair.bound.asFraction.multiply(2).invert());
};
