import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

import { priceToPairReserves } from "../components/pages/Earn/PositionCard/Stats";
import { scale } from "../components/pages/Trade/useTrade";
import type { IMarket, IMarketInfo } from "../contexts/environment";

export const outputAmount = (
  market: IMarket,
  marketInfo: IMarketInfo,
  inputAmount: TokenAmount,
  price: Price,
  referenceMarket: [TokenAmount, TokenAmount]
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
      ? inputAmount.scale(
          marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalSupply)
        )
      : new TokenAmount(inputAmount.token, 0);

    // TODO: remove repay tokens
    const repayAmount = determineRepayAmount(
      inputAmount,
      market,
      price,
      referenceMarket[0],
      referenceMarket[1]
    );
    return new TokenAmount(
      market.pair.speculativeToken,
      liquidityToSpeculative(lpAmount, market).raw
    ).subtract(
      new TokenAmount(
        market.pair.speculativeToken,
        repayAmount.multiply(scale).quotient.toString()
      )
    );
  }
};

export const determineBorrowAmount = (
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

  const s = new Fraction(10 ** 9);

  return numerator.scale(denominator.invert()).scale(s.invert()).scale(s);
};

const determineRepayAmount = (
  inputAmount: TokenAmount,
  market: IMarket,
  price: Price,
  u0: TokenAmount,
  u1: TokenAmount
) => {
  const liquidity = speculativeToLiquidity(inputAmount, market);
  const [r0, r1] = priceToPairReserves(price, liquidity, market);

  const numerator = u0.multiply(r1).add(u1.multiply(r0)).add(r0.multiply(r1));
  const denominator = u0.asFraction.subtract(r0);
  return numerator.multiply(1000).divide(denominator.multiply(997));
};

export const speculativeToLiquidity = (
  speculative: TokenAmount,
  market: IMarket
): TokenAmount => {
  return new TokenAmount(
    market.pair.lp,
    speculative.scale(market.pair.bound.asFraction.multiply(2).invert()).raw
  );
};

export const liquidityToSpeculative = (
  liquidity: TokenAmount,
  market: IMarket
): TokenAmount => {
  return new TokenAmount(
    market.pair.speculativeToken,
    liquidity.scale(market.pair.bound.asFraction.multiply(2)).raw
  );
};

export const convertShareToLiquidity = (
  share: TokenAmount,
  market: IMarket,
  marketInfo: IMarketInfo
): TokenAmount => {
  // TODO: simulate accrual
  return new TokenAmount(
    market.token,
    share.scale(
      marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalSupply)
    ).raw
  );
};
