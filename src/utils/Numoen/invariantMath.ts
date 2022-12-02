import type { IMarket, IPairInfo } from "@dahlia-labs/numoen-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";

// TODO: fix this check
// export const checkInvariant = (
//   baseAmount: TokenAmount,
//   speculativeAmount: TokenAmount,
//   liquidity: TokenAmount,
//   market: IMarket
// ): boolean => {
//   const scale0 = baseAmount
//     .scale(new Fraction(10 ** (18 - market.pair.baseScaleFactor)))
//     .scale(liquidity.invert());
//   const scale1 = speculativeAmount
//     .scale(new Fraction(10 ** (18 - market.pair.speculativeScaleFactor)))
//     .scale(liquidity.invert());

//   const b = scale1.asFraction.multiply(market.pair.bound);
//   const c = scale1.asFraction.multiply(scale1).divide(4);
//   const d = market.pair.bound.asFraction.multiply(market.pair.bound);

//   return scale0.asFraction.add(b).equalTo(c.add(d));
// };
const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));
const doubleScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(36));

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
) => {
  const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));
  const doubleScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(36));

  const prec = JSBI.BigInt(10 ** 0);

  const p0 = pairInfo.baseAmount.raw;
  const p1 = pairInfo.speculativeAmount.raw;
  const ts = pairInfo.totalLPSupply.raw;
  const liq = JSBI.multiply(JSBI.divide(liquidity.raw, prec), prec);

  // current reserve values
  const r0 = JSBI.divide(JSBI.multiply(p0, doubleScale), ts);
  const r1 = JSBI.divide(JSBI.multiply(p1, doubleScale), ts);

  // scaled input values
  const s0 = JSBI.divide(JSBI.multiply(p0, liq), ts);
  const s1 = JSBI.divide(JSBI.multiply(p1, liq), ts);

  // new reserve values
  const a0 = JSBI.divide(
    JSBI.multiply(JSBI.add(p0, s0), doubleScale),
    JSBI.add(liq, ts)
  );
  const a1 = JSBI.divide(
    JSBI.multiply(JSBI.add(p1, s1), doubleScale),
    JSBI.add(liq, ts)
  );

  console.log("b", JSBI.equal(r0, a0));
  console.log("s", JSBI.equal(r1, a1));

  checkInvariantJSBI(
    JSBI.add(p0, s0),
    JSBI.add(p1, s1),
    JSBI.add(liq, ts),
    market.pair.bound.asFraction.multiply(scale).quotient
  );
};

export const checkInvariantJSBI = (
  r0: JSBI,
  r1: JSBI,
  liq: JSBI,
  ub: JSBI
): boolean => {
  const prec = JSBI.BigInt(10 ** 0);

  console.log(
    "remainder 0",
    JSBI.remainder(JSBI.multiply(r0, doubleScale), liq).toString()
  );
  console.log(
    "remainder 1",
    JSBI.remainder(JSBI.multiply(r1, doubleScale), liq).toString()
  );

  const s0 = JSBI.divide(
    JSBI.multiply(r0, doubleScale),
    JSBI.multiply(JSBI.divide(liq, prec), prec)
  );

  const s1 = JSBI.divide(
    JSBI.multiply(r1, doubleScale),
    JSBI.multiply(JSBI.divide(liq, prec), prec)
  );

  const a = s0;
  const b = JSBI.divide(JSBI.multiply(s1, ub), scale);
  const c = JSBI.divide(
    JSBI.divide(JSBI.multiply(s1, s1), doubleScale),
    JSBI.BigInt(4)
  );
  const d = JSBI.multiply(ub, ub);
  console.log(JSBI.add(a, b).toString(), JSBI.add(c, d).toString());
  console.log("Invariant", JSBI.GE(JSBI.add(a, b), JSBI.add(c, d)));

  return JSBI.GE(JSBI.add(a, b), JSBI.add(c, d));
};

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

export const baseToLiquidity = (
  baseAmount: TokenAmount,
  price: Fraction,
  market: IMarket
) => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));

  const b = JSBI.divide(JSBI.multiply(a, a), JSBI.BigInt(4));
  const c = JSBI.multiply(ub, ub);
  const d = JSBI.multiply(a, ub);

  const l = JSBI.divide(
    JSBI.multiply(baseAmount.raw, doubleScale),
    JSBI.subtract(JSBI.add(b, c), d)
  );

  return new TokenAmount(market.pair.lp, l);
};

export const roundLiquidity = (liquidity: TokenAmount): TokenAmount => {
  const sc = new Fraction(10 ** 9);
  return liquidity.scale(sc.invert()).scale(sc);
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

export const liquidityToSpec = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));
  const b = JSBI.add(
    JSBI.divide(JSBI.multiply(a, liquidity.raw), scale),
    JSBI.BigInt(1)
  );
  return new TokenAmount(market.pair.speculativeToken, b);
};

export const liquidityToBase = (
  liquidity: TokenAmount,
  price: Fraction,
  market: IMarket
) => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;
  const p = price.asFraction.multiply(scale).quotient;

  const a = JSBI.multiply(JSBI.BigInt(2), JSBI.subtract(ub, p));

  const b = JSBI.divide(JSBI.multiply(a, a), JSBI.BigInt(4));
  const c = JSBI.multiply(ub, ub);
  const d = JSBI.multiply(a, ub);

  const r = JSBI.add(
    JSBI.divide(
      JSBI.multiply(JSBI.subtract(JSBI.add(b, c), d), liquidity.raw),
      doubleScale
    ),
    JSBI.BigInt(1)
  );

  return new TokenAmount(market.pair.baseToken, r);
};
