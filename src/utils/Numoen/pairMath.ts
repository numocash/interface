import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Price } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

export const getBaseOut = (
  amountSIn: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  upperBound: Price,
  market: IMarket
): TokenAmount => {
  const scaleIn = amountSIn.scale(liquidity.invert());
  const scale1 = r1.scale(liquidity.invert());

  const a = scaleIn.scale(upperBound.asFraction);
  const b = scaleIn.scale(scaleIn).scale(new Fraction(4).invert());
  const c = scaleIn.scale(scale1).scale(new Fraction(2).invert());

  return new TokenAmount(
    market.pair.baseToken,
    a.subtract(b).subtract(c).scale(liquidity).raw
  );
};

export const getBaseIn = (
  amountSOut: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  upperBound: Price,
  market: IMarket
): TokenAmount => {
  const scaleOut = amountSOut.scale(liquidity.invert());
  const scale1 = r1.scale(liquidity.invert());

  const a = scaleOut.scale(upperBound.asFraction);
  const b = scaleOut.scale(scaleOut).scale(new Fraction(4).invert());
  const c = scaleOut.scale(scale1).scale(new Fraction(2).invert());

  return new TokenAmount(
    market.pair.baseToken,
    a.add(b).subtract(c).scale(liquidity).raw
  );
};
