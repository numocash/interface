import type { BigNumber } from "@ethersproject/bignumber";
import { useQuery } from "@tanstack/react-query";
import { CurrencyAmount, Fraction, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { chunk } from "lodash";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";
import { useContractReads } from "wagmi";

import type { Lendgine } from "../constants/types";
import { useEnvironment } from "../contexts/environment2";
import {
  lendgineABI,
  liquidityManagerABI,
  useLiquidityManagerPositions,
} from "../generated";
import { LendginesDocument } from "../gql/numoen/graphql";
import type { RawLendgine } from "../services/graphql/numoen";
import { parseLendgines } from "../services/graphql/numoen";
import { fractionToPrice } from "../utils/Numoen/price";
import { scale } from "../utils/Numoen/trade";
import type { Tuple } from "../utils/readonlyTuple";
import type { HookArg } from "./useBalance";
import { useChain } from "./useChain";
import { useClient } from "./useClient";
import { isValidMarket } from "./useMarket";
import { useGetAddressToToken } from "./useTokens";
import type { WrappedTokenInfo } from "./useTokens2";

export const useLendginesForTokens = (
  tokens: HookArg<readonly [WrappedTokenInfo, WrappedTokenInfo]>
) => {
  const lendgines = useAllLendgines();

  return useMemo(() => {
    if (!tokens || !lendgines) return null;
    return lendgines.filter(
      (l) =>
        (l.token0.equals(tokens[0]) && l.token1.equals(tokens[1])) ||
        (l.token0.equals(tokens[1]) && l.token1.equals(tokens[0]))
    );
  }, [lendgines, tokens]);
};

export const useLendgine = <L extends Lendgine>(lendgine: HookArg<L>) => {
  const contracts = lendgine
    ? ([
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "totalPositionSize",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "totalLiquidityBorrowed",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "rewardPerPositionStored",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "lastUpdate",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "totalSupply",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "reserve0",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "reserve1",
        },
        {
          address: lendgine.address,
          abi: lendgineABI,
          functionName: "totalLiquidity",
        },
      ] as const)
    : undefined;

  return useContractReads({
    //  ^?
    contracts,
    allowFailure: false,
    staleTime: 3_000,
    enabled: !!contracts,
    select: (data) => {
      if (!lendgine) return undefined;

      return {
        totalPositionSize: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data[0].toString()
        ),
        totalLiquidityBorrowed: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data[1].toString()
        ),
        rewardPerPositionStored: fractionToPrice(
          new Fraction(data[2].toString(), scale),
          lendgine.lendgine,
          lendgine.token1
        ),
        lastUpdate: +data[3].toString(),
        totalSupply: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data[4].toString()
        ),
        reserve0: CurrencyAmount.fromRawAmount(
          lendgine.token0,
          data[5].toString()
        ),
        reserve1: CurrencyAmount.fromRawAmount(
          lendgine.token1,
          data[6].toString()
        ),
        totalLiquidity: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data[7].toString()
        ),
      };
    },
  });
};

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>
) => {
  const contracts = useMemo(
    () =>
      lendgines
        ? lendgines.flatMap(
            (lendgine) =>
              [
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "totalPositionSize",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "totalLiquidityBorrowed",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "rewardPerPositionStored",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "lastUpdate",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "totalSupply",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "reserve0",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "reserve1",
                },
                {
                  address: lendgine.address,
                  abi: lendgineABI,
                  functionName: "totalLiquidity",
                },
              ] as const
          )
        : undefined,
    [lendgines]
  );

  return useContractReads({
    //  ^?
    contracts,
    allowFailure: false,
    staleTime: 3_000,
    enabled: !!lendgines,
    select: (data) => {
      if (!lendgines) return undefined;

      return chunk(data, 8).map((c, i) => {
        const lendgineInfo = c as Tuple<BigNumber, 8>;
        const lendgine = lendgines?.[i];
        invariant(lendgine);

        return {
          totalPositionSize: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[0].toString()
          ),
          totalLiquidityBorrowed: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[1].toString()
          ),
          rewardPerPositionStored: fractionToPrice(
            new Fraction(lendgineInfo[2].toString(), scale),
            lendgine.lendgine,
            lendgine.token1
          ),
          lastUpdate: +lendgineInfo[3].toString(),
          totalSupply: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[4].toString()
          ),
          reserve0: CurrencyAmount.fromRawAmount(
            lendgine.token0,
            lendgineInfo[5].toString()
          ),
          reserve1: CurrencyAmount.fromRawAmount(
            lendgine.token1,
            lendgineInfo[6].toString()
          ),
          totalLiquidity: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[7].toString()
          ),
        };
      });
    },
  });
};

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  return useLiquidityManagerPositions({
    address: environment.base.liquidityManager,
    args: address && lendgine ? [address, lendgine.address] : undefined,
    staleTime: 3_000,
    enabled: !!lendgine && !!address,
    select: (data) => {
      if (!lendgine) return undefined;
      return {
        size: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data.size.toString()
        ),
        rewardPerPositionPaid: fractionToPrice(
          new Fraction(data.rewardPerPositionPaid.toString()),
          lendgine.lendgine,
          lendgine.token1
        ),
        tokensOwed: CurrencyAmount.fromRawAmount(
          lendgine.token1,
          data.tokensOwed.toString()
        ),
      };
    },
  });
};

export const useLendginesPosition = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  const contracts = useMemo(
    () =>
      !!lendgines && !!address
        ? lendgines.map(
            (l) =>
              ({
                address: environment.base.liquidityManager,
                abi: liquidityManagerABI,
                functionName: "positions",
                args: [address, l.address],
              } as const)
          )
        : undefined,
    [address, environment.base.liquidityManager, lendgines]
  );

  return useContractReads({
    contracts,
    staleTime: 3_000,
    allowFailure: false,
    enabled: !!contracts,
    select: (data) => {
      if (!lendgines) return undefined;
      return data.map((p, i) => {
        const lendgine = lendgines[i];
        invariant(lendgine);
        return {
          size: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            p.size.toString()
          ),
          rewardPerPositionPaid: fractionToPrice(
            new Fraction(p.rewardPerPositionPaid.toString(), scale),
            lendgine.lendgine,
            lendgine.token1
          ),
          tokensOwed: CurrencyAmount.fromRawAmount(
            lendgine.token1,
            p.tokensOwed.toString()
          ),
        };
      });
    },
  });
};

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

  return useQuery<RawLendgine[]>(queryKey, queryFn, { staleTime: Infinity });
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
