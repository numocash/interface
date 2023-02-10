import type { Token } from "@uniswap/sdk-core";

import type { Lendgine } from "../constants";
import type { LendgineInfo } from "../hooks/useLendgine";
import type { WrappedTokenInfo } from "../hooks/useTokens2";
import { numoenPrice } from "./Numoen/price";

export const pickLongLendgines = (
  lendgines: readonly Lendgine[],
  base: Token
) => lendgines.filter((l) => l.token0.equals(base));

export const pickShortLendgines = (
  lendgines: readonly Lendgine[],
  base: Token
) => lendgines.filter((l) => l.token1.equals(base));

export const isLongLendgine = (lendgine: Lendgine, base: Token) =>
  lendgine.token0.equals(base);

export const isShortLendgine = (lendgine: Lendgine, base: Token) =>
  lendgine.token1.equals(base);

export const lendginePrice = (
  lendgines: readonly Lendgine[],
  lendgineInfos: readonly LendgineInfo[],
  base: WrappedTokenInfo
) => {
  const index = lendgineInfos
    ? lendgineInfos.findIndex(
        (l) => l.reserve0.greaterThan(0) && l.reserve1.greaterThan(0)
      )
    : null;

  if (!index) return null;
  const lendgine = lendgines[index];
  const lendgineInfo = lendgineInfos[index];

  const price =
    lendgine && lendgineInfo ? numoenPrice(lendgine, lendgineInfo) : null;
  return price?.quoteCurrency.equals(base) ? price.invert() : price;
};
