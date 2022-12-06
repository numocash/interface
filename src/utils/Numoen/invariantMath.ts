import type { IMarket, IPairInfo } from "@dahlia-labs/numoen-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";

const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const checkInvariant = (
  baseAmount: TokenAmount,
  speculativeAmount: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): boolean => {
  const r0 = baseAmount.raw;
  const r1 = speculativeAmount.raw;
  const liq = liquidity.raw;
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;

  return checkInvariantJSBI(r0, r1, liq, ub);
};

export const calcProportion = (
  liquidity: TokenAmount,
  pairInfo: IPairInfo,
  market: IMarket
): [TokenAmount, TokenAmount] => {
  const p0 = pairInfo.baseAmount.raw;
  const p1 = pairInfo.speculativeAmount.raw;
  const ts = pairInfo.totalLPSupply.raw;
  const liq = liquidity.raw;

  // scaled input values
  const s0 = JSBI.add(JSBI.divide(JSBI.multiply(p0, liq), ts), JSBI.BigInt(1));
  const s1 = JSBI.add(JSBI.divide(JSBI.multiply(p1, liq), ts), JSBI.BigInt(1));

  return [
    new TokenAmount(market.pair.baseToken, s0),
    new TokenAmount(market.pair.speculativeToken, s1),
  ];
};

export const checkInvariantJSBI = (
  r0: JSBI,
  r1: JSBI,
  liq: JSBI,
  ub: JSBI
): boolean => {
  if (JSBI.EQ(liq, JSBI.BigInt(0))) {
    return JSBI.EQ(r0, JSBI.BigInt(0)) && JSBI.EQ(r1, JSBI.BigInt(0));
  }

  const s0 = JSBI.divide(JSBI.multiply(r0, scale), liq);
  const s1 = JSBI.divide(JSBI.multiply(r1, scale), liq);

  const a = s0;
  const b = JSBI.divide(JSBI.multiply(s1, ub), scale);
  const c = JSBI.divide(
    JSBI.divide(JSBI.multiply(s1, s1), scale),
    JSBI.BigInt(4)
  );
  const d = JSBI.divide(JSBI.multiply(ub, ub), scale);

  return JSBI.GE(JSBI.add(a, b), JSBI.add(c, d));
};

// rounds down which might not be the desired behavior
export const specToLiquidity = (
  speculativeAmount: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));
  const b = JSBI.multiply(speculativeAmount.raw, scale);

  return new TokenAmount(market.pair.lp, JSBI.divide(b, a));
};

// rounds down which might not be the desired behavior
export const baseToLiquidity = (
  baseAmount: TokenAmount,
  price: Fraction,
  market: IMarket
) => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));

  const b = JSBI.divide(
    JSBI.divide(JSBI.multiply(a, a), scale),
    JSBI.BigInt(4)
  );
  const c = JSBI.divide(JSBI.multiply(ub, ub), scale);
  const d = JSBI.divide(JSBI.multiply(a, ub), scale);

  const l = JSBI.divide(
    JSBI.multiply(baseAmount.raw, scale),
    JSBI.subtract(JSBI.add(b, c), d)
  );

  return new TokenAmount(market.pair.lp, l);
};

export const roundLiquidity = (liquidity: TokenAmount): TokenAmount => {
  const sc = new Fraction(10 ** 9);
  return liquidity.scale(sc.invert()).scale(sc);
};

export const add1 = (amount: TokenAmount): TokenAmount => {
  return new TokenAmount(amount.token, JSBI.add(amount.raw, JSBI.BigInt(1)));
};

// export const scaleAmount = (amount: TokenAmount, scaleFactor: number): JSBI => {
//   return JSBI.multiply(
//     amount.raw,
//     JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - scaleFactor))
//   );
// };

// export const scaleDownAmount = (amount: TokenAmount): JSBI => {
//   return JSBI.divide(
//     amount.raw,
//     JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - amount.token.decimals))
//   );
// };

// export const scaleTokenAmount = (
//   amount: TokenAmount,
//   scaleFactor: number
// ): TokenAmount => {
//   return new TokenAmount(
//     new Token({ ...amount.token.info, decimals: 18 }),
//     JSBI.multiply(
//       amount.raw,
//       JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - scaleFactor))
//     )
//   );
// };

// rounds down which might not be the desired behavior
export const liquidityToSpec = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));
  const b = JSBI.divide(JSBI.multiply(a, liquidity.raw), scale);

  return new TokenAmount(market.pair.speculativeToken, b);
};

// rounds down which might not be the desired behavior
export const liquidityToBase = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
) => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));

  const b = JSBI.divide(
    JSBI.divide(JSBI.multiply(a, a), scale),
    JSBI.BigInt(4)
  );
  const c = JSBI.divide(JSBI.multiply(ub, ub), scale);
  const d = JSBI.divide(JSBI.multiply(a, ub), scale);

  const r = JSBI.divide(
    JSBI.multiply(JSBI.subtract(JSBI.add(b, c), d), liquidity.raw),
    scale
  );

  return new TokenAmount(market.pair.baseToken, r);
};
