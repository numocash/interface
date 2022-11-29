import type { IMarket } from "@dahlia-labs/numoen-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

export const checkInvariant = (
  baseAmount: TokenAmount,
  speculativeAmount: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): boolean => {
  const scale0 = baseAmount.scale(liquidity.invert());
  const scale1 = speculativeAmount.scale(liquidity.invert());

  const b = scale1.asFraction.multiply(market.pair.bound);
  const c = scale1.asFraction.multiply(scale1).divide(4);
  const d = market.pair.bound.asFraction.multiply(market.pair.bound);

  return scale0.asFraction.add(b).equalTo(c.add(d));
};

export const specToLiquidity = (
  speculativeAmount: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  return new TokenAmount(
    market.pair.lp,
    speculativeAmount.scale(
      market.pair.bound.subtract(price).multiply(2).invert()
    ).raw
  );
};

export const baseToLiquidity = (
  baseAmount: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  const a = market.pair.bound.asFraction.subtract(price);
  const b = market.pair.bound.asFraction.multiply(market.pair.bound.asFraction);
  const c = market.pair.bound.asFraction.multiply(2).multiply(a);

  const num = a.multiply(a).add(b).subtract(c);

  return new TokenAmount(market.pair.lp, baseAmount.scale(num.invert()).raw);
};

export const roundLiquidity = (liquidity: TokenAmount): TokenAmount => {
  const sc = new Fraction(10 ** 9);
  return liquidity.scale(sc.invert()).scale(sc);
};

export const liquidityToSpec = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  return new TokenAmount(
    market.pair.speculativeToken,
    liquidity.scale(
      market.pair.bound.asFraction.subtract(price).multiply(2)
    ).raw
  );
};

export const liquidityToBase = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  const a = market.pair.bound.asFraction.subtract(price);
  const b = market.pair.bound.asFraction.multiply(market.pair.bound.asFraction);
  const c = market.pair.bound.asFraction.multiply(2).multiply(a);

  const num = a.multiply(a).add(b).subtract(c);

  return new TokenAmount(market.pair.baseToken, liquidity.scale(num).raw);
};
