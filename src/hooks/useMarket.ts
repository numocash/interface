import { useCallback } from "react";

import type { Lendgine } from "../constants/types";
import { useEnvironment } from "../contexts/useEnvironment";
import { useAllLendgines } from "./useAllLendgines";
import type { WrappedTokenInfo } from "./useTokens2";

export type Market = readonly [WrappedTokenInfo, WrappedTokenInfo];

export const useLendgineToMarket = (lendgine: Lendgine): Market => {
  return useGetLendgineToMarket()(lendgine);
};

export const useGetLendgineToMarket = () => {
  const environment = useEnvironment();

  return useCallback(
    (lendgine: Lendgine): Market => {
      const specialtyMatches = environment.interface.specialtyMarkets?.find(
        (m) => isEqualToMarket(lendgine.token0, lendgine.token1, m)
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

      return lendgine.token0.equals(environment.interface.wrappedNative)
        ? ([lendgine.token0, lendgine.token1] as const)
        : ([lendgine.token1, lendgine.token0] as const);
    },
    [
      environment.interface.specialtyMarkets,
      environment.interface.wrappedNative,
    ]
  );
};

export const useMarketToLendgines = (
  market: Market
): readonly Lendgine[] | null => {
  const lendgines = useAllLendgines();
  return (
    lendgines?.filter(
      (l) =>
        !!market.find((m) => m.equals(l.token0)) &&
        !!market.find((m) => m.equals(l.token1))
    ) ?? null
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

export const isEqualToMarket = (
  token0: WrappedTokenInfo,
  token1: WrappedTokenInfo,
  market: Market
) =>
  (market[0].equals(token0) && market[1].equals(token1)) ||
  (market[0].equals(token1) && market[1].equals(token0));

export const isValidMarket = (
  token0: WrappedTokenInfo,
  token1: WrappedTokenInfo,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[]
) =>
  [token0, token1].find((t) => t.equals(wrappedNative)) ||
  (specialtyMarkets &&
    specialtyMarkets
      .map((m) => isEqualToMarket(token0, token1, m))
      .includes(true));
