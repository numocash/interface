import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, Percent, TokenAmount } from "@dahlia-labs/token-utils";

import { borrowRate } from "../components/pages/Earn/PositionCard/Stats";
import { scale } from "../components/pages/Trade/useTrade";
import type { IMarket, IMarketInfo, IPairInfo } from "../contexts/environment";
import type { ISettings } from "../contexts/settings";

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
  slippageBps: Percent
) => {
  const x0 = price.asFraction.multiply(price);
  const x1 = market.pair.bound.subtract(price).multiply(2);

  const numerator = inputAmount
    .scale(x1)
    .add(inputAmount.scale(x0.divide(price)).reduceBy(slippageBps));

  const denominator = market.pair.bound.asFraction
    .multiply(2)
    .subtract(x0.divide(price).multiply(slippageBps))
    .subtract(x1);

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
