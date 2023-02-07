import { Fraction } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { useContractReads } from "wagmi";

import type { Lendgine } from "../constants";
import { useEnvironment } from "../contexts/environment2";
import { lendgineABI } from "../generated";
import type { HookArg } from "./useBalance";
import type { WrappedTokenInfo } from "./useTokens2";

export const useLendginesForTokens = (
  tokens: HookArg<readonly [WrappedTokenInfo, WrappedTokenInfo]>
) => {
  const environment = useEnvironment();

  return useMemo(() => {
    if (!tokens) return null;
    return environment.lendgines.filter(
      (l) =>
        (l.token0.equals(tokens[0]) && l.token1.equals(tokens[1])) ||
        (l.token0.equals(tokens[1]) && l.token1.equals(tokens[0]))
    );
  }, [environment.lendgines, tokens]);
};

export type LendgineInfo = {
  totalPositionSize: Fraction;
  totalLiquidityBorrowed: Fraction;
  rewardPerPositionStored: Fraction;
  lastUpdate: number;

  totalSupply: Fraction;

  reserve0: Fraction;
  reserve1: Fraction;
  totalLiquidity: Fraction;
};

export const useLendgine = (lendgine: HookArg<Lendgine>) => {
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

  const query = useContractReads({
    //  ^?
    contracts,
    allowFailure: true,
    watch: true,
    staleTime: Infinity,
    enabled: !!lendgine,
  });

  const parseReturn = (
    lendgine: (typeof query)["data"]
  ): LendgineInfo | undefined => {
    if (!lendgine) return undefined;
    return {
      totalPositionSize: new Fraction(lendgine[0].toString()),
      totalLiquidityBorrowed: new Fraction(lendgine[1].toString()),
      rewardPerPositionStored: new Fraction(lendgine[2].toString()),
      lastUpdate: +lendgine[3].toString(),
      totalSupply: new Fraction(lendgine[4].toString()),
      reserve0: new Fraction(lendgine[5].toString()),
      reserve1: new Fraction(lendgine[6].toString()),
      totalLiquidity: new Fraction(lendgine[7].toString()),
    };
  };

  const updatedQuery = {
    ...query,
    data: parseReturn(query.data),
    refetch: async (options: Parameters<(typeof query)["refetch"]>[0]) => {
      const data = await query.refetch(options);
      return parseReturn(data.data);
    },
  };

  return updatedQuery;
};
