import JSBI from "jsbi";

import { scale } from "./trade";

export const convertLiquidityToShare = (
  liquidity: JSBI,
  totalLiquidityBorrowed: JSBI,
  totalSupply: JSBI
) => {
  if (JSBI.equal(totalLiquidityBorrowed, JSBI.BigInt(0))) return liquidity;
  return JSBI.divide(
    JSBI.multiply(liquidity, totalSupply),
    totalLiquidityBorrowed
  );
};

export const convertShareToLiquidity = (
  shares: JSBI,
  totalLiquidityBorrowed: JSBI,
  totalSupply: JSBI
) => {
  return JSBI.divide(
    JSBI.multiply(shares, totalLiquidityBorrowed),
    totalSupply
  );
};

export const convertCollateralToLiquidity = (
  collateral: JSBI,
  token1Scale: JSBI,
  upperBound: JSBI
) => {
  return JSBI.divide(
    JSBI.multiply(JSBI.multiply(collateral, token1Scale), scale),
    JSBI.multiply(upperBound, JSBI.BigInt(2))
  );
};

export const convertLiquidityToCollateral = (
  liquidity: JSBI,
  token1Scale: JSBI,
  upperBound: JSBI
) => {
  return JSBI.divide(
    JSBI.divide(
      JSBI.multiply(liquidity, JSBI.multiply(upperBound, JSBI.BigInt(2))),
      scale
    ),
    token1Scale
  );
};

export const exponentiate = (exp: number) =>
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(exp));
