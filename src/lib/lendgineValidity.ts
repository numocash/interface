import type { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import { priceToFraction } from "./price";
import type { Lendgine } from "./types/lendgine";
import type { Market } from "./types/market";
import type { WrappedTokenInfo } from "./types/wrappedTokenInfo";

export const lendgineToMarket = (
  lendgine: Lendgine,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[]
) => {
  const specialtyMatches = specialtyMarkets?.find((m) =>
    isEqualToMarket(lendgine.token0, lendgine.token1, m)
  );

  if (specialtyMatches)
    return [
      lendgine.token0.equals(specialtyMatches[0])
        ? lendgine.token0
        : lendgine.token1,
      lendgine.token0.equals(specialtyMatches[0])
        ? lendgine.token1
        : lendgine.token0,
    ] as const;

  return lendgine.token0.equals(wrappedNative)
    ? ([lendgine.token0, lendgine.token1] as const)
    : ([lendgine.token1, lendgine.token0] as const);
};

export const marketToLendgines = (
  market: Market,
  allLendgines: readonly Lendgine[]
) => allLendgines.filter((l) => isEqualToMarket(l.token0, l.token1, market));

export const isValidLendgine = (
  lendgine: Lendgine,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[]
) =>
  isValidMarket(
    lendgineToMarket(lendgine, wrappedNative, specialtyMarkets),
    wrappedNative,
    specialtyMarkets
  ) && isValidBound(priceToFraction(lendgine.bound));

export const isValidMarket = (
  market: Market,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[]
) =>
  !!market.find((t) => t.equals(wrappedNative)) ||
  !!(
    specialtyMarkets &&
    specialtyMarkets
      .map((m) => market[0].equals(m[0]) && market[1].equals(m[1]))
      .includes(true)
  );

export const isValidBound = (bound: Fraction) => {
  const quotient = bound.greaterThan(1)
    ? bound.quotient
    : bound.invert().quotient;
  if (!JSBI.bitwiseAnd(quotient, JSBI.subtract(quotient, JSBI.BigInt(1))))
    return false;

  return true;
};

const isEqualToMarket = (
  token0: WrappedTokenInfo,
  token1: WrappedTokenInfo,
  market: Market
) =>
  (market[0].equals(token0) && market[1].equals(token1)) ||
  (market[0].equals(token1) && market[1].equals(token0));
