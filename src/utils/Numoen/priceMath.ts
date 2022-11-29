import type {
  IMarket,
  IMarketInfo,
  IPair,
  IPairInfo,
} from "@dahlia-labs/numoen-utils";
import type { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import { Price } from "@dahlia-labs/token-utils";

export const pairInfoToPrice = (pairInfo: IPairInfo, pair: IPair): Price => {
  if (pairInfo.totalLPSupply.equalTo(0))
    return new Price(pair.speculativeToken, pair.baseToken, 1, 0);

  const scale1 = pairInfo.speculativeAmount.divide(pairInfo.totalLPSupply);
  const priceFraction = pair.bound.subtract(scale1.divide(2));
  return new Price(
    pair.speculativeToken,
    pair.baseToken,
    priceFraction.denominator,
    priceFraction.numerator
  );
};

export const priceToPairReserves = (
  price: Price,
  liquidity: TokenAmount,
  market: IMarket
): [Fraction, Fraction] => {
  const scale0 = price.asFraction.multiply(price);
  const scale1 = market.pair.bound.subtract(price).multiply(2);

  return [liquidity.multiply(scale0), liquidity.multiply(scale1)];
};

export const pricePerLP = (pairInfo: IPairInfo, pair: IPair): Price => {
  const price = pairInfoToPrice(pairInfo, pair);
  if (price.equalTo(0)) return new Price(pair.lp, pair.baseToken, 1, 0);
  const scale0 = pairInfo.baseAmount.divide(pairInfo.totalLPSupply);
  const scale1 = pairInfo.speculativeAmount.divide(pairInfo.totalLPSupply);
  const priceFraction = scale0.add(scale1.multiply(price));

  return new Price(
    pair.lp,
    pair.baseToken,
    priceFraction.denominator,
    priceFraction.numerator
  );
};

export const totalValue = (
  marketInfo: IMarketInfo,
  pairInfo: IPairInfo,
  market: IMarket
): TokenAmount => {
  const price = pricePerLP(pairInfo, market.pair);
  return price.quote(marketInfo.totalLiquidity);
};
