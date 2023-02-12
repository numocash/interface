import { useCallback } from "react";

import type { Lendgine } from "../constants";
import { useEnvironment } from "../contexts/environment2";
import type { WrappedTokenInfo } from "./useTokens2";

export type Market = readonly [WrappedTokenInfo, WrappedTokenInfo];

export const useLendgineToMarket = (lendgine: Lendgine): Market => {
  return useGetLendgineToMarket()(lendgine);
};

export const useGetLendgineToMarket = () => {
  const environment = useEnvironment();

  return useCallback(
    (lendgine: Lendgine): Market => {
      if (
        lendgine.token0.equals(environment.interface.stablecoin) ||
        lendgine.token1.equals(environment.interface.stablecoin)
      ) {
        return lendgine.token0.equals(environment.interface.stablecoin)
          ? ([lendgine.token0, lendgine.token1] as const)
          : ([lendgine.token1, lendgine.token0] as const);
      }
      return lendgine.token0.equals(environment.interface.wrappedNative)
        ? ([lendgine.token0, lendgine.token1] as const)
        : ([lendgine.token1, lendgine.token0] as const);
    },
    [environment.interface.stablecoin, environment.interface.wrappedNative]
  );
};

// dedupe markets
export const dedupeMarkets = (
  markets: readonly Market[]
): readonly Market[] => {
  const seen = new Set<string>();

  return markets.filter((m) => {
    const id = `${m[0].address}_${m[1].address}`;
    if (seen.has(id)) {
      return false;
    } else {
      seen.add(id);
      return true;
    }
  });
};

// filter markets
