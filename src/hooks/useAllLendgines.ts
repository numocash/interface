import { useQuery } from "@tanstack/react-query";
import { Fraction, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { useCallback, useMemo } from "react";

import type { Lendgine } from "../constants/types";
import { useEnvironment } from "../contexts/useEnvironment";
import { LendginesDocument } from "../gql/numoen/graphql";
import { parseLendgines } from "../services/graphql/numoen";
import { fractionToPrice } from "../utils/Numoen/price";
import { scale } from "../utils/Numoen/trade";
import { useChain } from "./useChain";
import { useClient } from "./useClient";
import { isValidMarket } from "./useMarket";
import { useGetAddressToToken } from "./useTokens";

export const useExistingLendginesQueryKey = () => {
  const chain = useChain();
  const client = useClient();

  return ["existing lendgines", chain, client.numoen] as const;
};

export const useExistingLendginesQueryFn = () => {
  const client = useClient();
  return useCallback(async () => {
    const lendginesRes = await client.numoen.request(LendginesDocument);
    return parseLendgines(lendginesRes);
  }, [client.numoen]);
};

export const useExistingLendginesQuery = () => {
  const queryKey = useExistingLendginesQueryKey();
  const queryFn = useExistingLendginesQueryFn();

  return useQuery<ReturnType<typeof parseLendgines>>(queryKey, queryFn, {
    staleTime: Infinity,
    refetchInterval: 5 * 60 * 1_000,
  });
};

export const useAllLendgines = () => {
  const environment = useEnvironment();
  const addressToToken = useGetAddressToToken();
  const lendginesQuery = useExistingLendginesQuery();
  const chainID = useChain();

  return useMemo(() => {
    if (lendginesQuery.isLoading || !lendginesQuery.data) return null;

    return lendginesQuery.data
      .map((ld): Lendgine | undefined => {
        const token0 = addressToToken(ld.token0);
        const token1 = addressToToken(ld.token1);

        if (!token0 || !token1) return undefined; // tokens must be in token list
        // one of the tokens must be wrapped native or specialty
        if (
          !isValidMarket(
            token0,
            token1,
            environment.interface.wrappedNative,
            environment.interface.specialtyMarkets
          )
        )
          return undefined;

        const ub = new Fraction(ld.upperBound, scale);

        // bound must be a power of 2
        const quotient = ub.greaterThan(1) ? ub.quotient : ub.invert().quotient;
        if (!JSBI.bitwiseAnd(quotient, JSBI.subtract(quotient, JSBI.BigInt(1))))
          return undefined;

        return {
          token0,
          token1,
          token0Exp: ld.token0Exp,
          token1Exp: ld.token1Exp,
          bound: fractionToPrice(ub, token1, token0),
          lendgine: new Token(chainID, ld.address, 18),
          address: ld.address,
        };
      })
      .filter((f): f is Lendgine => !!f);
  }, [
    addressToToken,
    chainID,
    environment.interface.specialtyMarkets,
    environment.interface.wrappedNative,
    lendginesQuery.data,
    lendginesQuery.isLoading,
  ]);
};
