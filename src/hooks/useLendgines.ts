import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import type { BigNumber } from "ethers";
import { chunk } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { lendgineABI } from "../abis/lendgine";
import { scale } from "../lib/constants";
import { fractionToPrice } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import type { Tuple } from "../utils/readonlyTuple";
import { useContractReads } from "./internal/useContractReads";
import type { HookArg } from "./internal/utils";

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
    contracts,
    allowFailure: false,
    staleTime: Infinity,
    enabled: !!lendgines,
    watch: true,
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
