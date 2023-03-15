import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { useMemo } from "react";

import { lendgineABI } from "../generated";
import { scale } from "../lib/constants";
import { fractionToPrice } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import type { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";
import { useContractReads } from "./internal/useContractReads";
import type { HookArg } from "./internal/utils";
import { useAllLendgines } from "./useAllLendgines";

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
    staleTime: Infinity,
    watch: true,
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
