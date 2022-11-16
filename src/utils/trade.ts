import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

import { borrowRate } from "../components/pages/Earn/PositionCard/Stats";
import { scale } from "../components/pages/Trade/useTrade";
import type { IMarket, IMarketInfo, IPairInfo } from "../contexts/environment";

export const outputAmount = (
  market: IMarket,
  marketInfo: IMarketInfo,
  pairInfo: IPairInfo,
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
    const lpAmount = convertShareToLiquidity(inputAmount, market, marketInfo);
    const speculativeAmount = liquidityToSpeculative(lpAmount, market);

    const r0 = lpAmount.scale(
      pairInfo.baseAmount.divide(pairInfo.totalLPSupply)
    );
    const r1 = lpAmount.scale(
      pairInfo.speculativeAmount.divide(pairInfo.totalLPSupply)
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
  r0: TokenAmount,
  r1: TokenAmount,
  u0: TokenAmount,
  u1: TokenAmount
) => {
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
  const t = Math.round(Date.now() / 1000);
  const timeElapsed = t - marketInfo.lastUpdate;
  const br = borrowRate(marketInfo);
  const dilutionLPRequested = marketInfo.totalLiquidityBorrowed.scale(
    br.multiply(timeElapsed).divide(86400 * 365)
  );
  const dilutionLP = dilutionLPRequested.greaterThan(
    marketInfo.totalLiquidityBorrowed
  )
    ? marketInfo.totalLiquidityBorrowed
    : dilutionLPRequested;
  return new TokenAmount(
    market.pair.lp,
    marketInfo.totalSupply.greaterThan(0)
      ? share.scale(
          marketInfo.totalLiquidityBorrowed
            .subtract(dilutionLP)
            .divide(marketInfo.totalSupply)
        ).raw
      : share.raw
  );
};

export const newRewardPerLiquidity = (
  market: IMarket,
  marketInfo: IMarketInfo
): TokenAmount => {
  const t = Math.round(Date.now() / 1000);
  const timeElapsed = t - marketInfo.lastUpdate;
  const br = borrowRate(marketInfo);
  const dilutionLPRequested = marketInfo.totalLiquidityBorrowed.scale(
    br.multiply(timeElapsed).divide(86400 * 365)
  );
  const dilutionLP = dilutionLPRequested.greaterThan(
    marketInfo.totalLiquidityBorrowed
  )
    ? marketInfo.totalLiquidityBorrowed
    : dilutionLPRequested;
  const dilutionSpeculative = liquidityToSpeculative(dilutionLP, market);
  return dilutionSpeculative.scale(marketInfo.totalLiquidity.invert());
};
