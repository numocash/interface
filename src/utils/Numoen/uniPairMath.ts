import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";

export const getAmountOut = (
  amountIn: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const amountInWithFee = amountIn.scale(new Fraction(997));
  const numerator = amountInWithFee.scale(reserveOut);
  const denominator = reserveIn.scale(new Fraction(1000)).add(amountInWithFee);
  return new TokenAmount(
    reserveOut.token,
    numerator.scale(denominator.invert()).raw
  );
};

export const getAmountIn = (
  amountOut: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const numerator = reserveIn.scale(amountOut).scale(new Fraction(1000));
  const denominator = reserveOut.subtract(amountOut).scale(new Fraction(997));
  return new TokenAmount(
    reserveIn.token,
    numerator.scale(denominator.invert()).raw
  );
};
