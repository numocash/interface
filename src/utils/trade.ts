import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

import { scale } from "../components/pages/Trade/useTrade";
import type { IMarket, IMarketInfo } from "../contexts/environment";

export const outputAmount = (
  market: IMarket,
  marketInfo: IMarketInfo,
  inputAmount: TokenAmount
): { outputAmount: TokenAmount; baseAmount: TokenAmount } => {
  if (inputAmount.token === market.pair.speculativeToken) {
    // MINT
    const lpAmount = inputAmount
      .multiply(scale)
      .multiply(scale)
      .divide(market.pair.bound.asFraction.multiply(2));

    const outputAmount = marketInfo.totalLiquidityBorrowed.equalTo(0)
      ? new TokenAmount(market.token, lpAmount.quotient)
      : new TokenAmount(
          market.token,
          lpAmount
            .multiply(marketInfo.totalSupply)
            .divide(marketInfo.totalLiquidityBorrowed)
            .multiply(scale).quotient
        );

    const baseAmount = new TokenAmount(
      market.pair.baseToken,
      lpAmount.divide(scale).quotient
    );

    return { outputAmount, baseAmount };
  } else {
    // BURN
    const lpAmount = !marketInfo.totalSupply.equalTo(0)
      ? inputAmount
          .multiply(marketInfo.totalLiquidityBorrowed)
          .multiply(scale)
          .divide(marketInfo.totalSupply)
      : new Fraction(0);

    const outputAmount = new TokenAmount(
      market.pair.speculativeToken,
      lpAmount
        .multiply(2)
        .multiply(market.pair.bound.asFraction)
        .divide(scale).quotient
    );

    const baseAmount = new TokenAmount(
      market.pair.baseToken,
      lpAmount.divide(scale).quotient
    );

    return { outputAmount, baseAmount };
  }
};
