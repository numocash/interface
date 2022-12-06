import { TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";

export const getAmountOut = (
  amountIn: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const ai = amountIn.raw;
  const ri = reserveIn.raw;
  const r0 = reserveOut.raw;

  const amountInWithFee = JSBI.multiply(ai, JSBI.BigInt(997));
  const numerator = JSBI.multiply(amountInWithFee, r0);
  const denominator = JSBI.add(
    JSBI.multiply(ri, JSBI.BigInt(1000)),
    amountInWithFee
  );
  return new TokenAmount(reserveOut.token, JSBI.divide(numerator, denominator));
};

export const getAmountIn = (
  amountOut: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const ao = amountOut.raw;
  const ri = reserveIn.raw;
  const ro = reserveOut.raw;

  const numerator = JSBI.multiply(JSBI.multiply(ri, ao), JSBI.BigInt(1000));
  const denominator = JSBI.multiply(JSBI.subtract(ro, ao), JSBI.BigInt(997));
  return new TokenAmount(
    reserveIn.token,
    JSBI.add(JSBI.divide(numerator, denominator), JSBI.BigInt(1))
  );
};
