import type { IMarket, IMarketInfo } from "@dahlia-labs/numoen-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";

import { borrowRate } from "./jumprate";

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

  if (marketInfo.totalLiquidity.equalTo(0))
    return new TokenAmount(market.pair.speculativeToken, 0);

  return dilutionSpeculative.scale(marketInfo.totalLiquidity.invert());
};
