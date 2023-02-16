import { CurrencyAmount, Price } from "@uniswap/sdk-core";
import type { BigNumber } from "ethers";
import { chunk } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";
import { useContractReads } from "wagmi";

import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../constants/types";
import { useEnvironment } from "../contexts/environment2";
import {
  lendgineABI,
  liquidityManagerABI,
  useLiquidityManagerPositions,
} from "../generated";
import type { Tuple } from "../utils/readonlyTuple";
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

  const query = useContractReads({
    //  ^?
    contracts,
    allowFailure: false,
    watch: true,
    staleTime: Infinity,
    enabled: !!lendgine,
  });

  const parseReturn = (
    lendgineInfo: (typeof query)["data"]
  ): LendgineInfo<L> | undefined => {
    if (!lendgineInfo) return undefined;

    invariant(!!lendgine);

    return {
      totalPositionSize: CurrencyAmount.fromRawAmount(
        lendgine.lendgine,
        lendgineInfo[0].toString()
      ),
      totalLiquidityBorrowed: CurrencyAmount.fromRawAmount(
        lendgine.lendgine,
        lendgineInfo[1].toString()
      ),
      rewardPerPositionStored: new Price(
        lendgine.lendgine,
        lendgine.token1,
        1,
        lendgineInfo[2].toString()
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

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>
) => {
  const contracts = lendgines
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
    : undefined;

  const query = useContractReads({
    //  ^?
    contracts,
    allowFailure: false,
    watch: true,
    staleTime: Infinity,
    enabled: !!lendgines,
  });

  const parseReturn = (
    lendginesQuery: (typeof query)["data"]
  ): LendgineInfo<L>[] | undefined => {
    if (!lendginesQuery) return undefined;

    return chunk(lendginesQuery, 8).map((c, i) => {
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
        rewardPerPositionStored: new Price(
          lendgine.lendgine,
          lendgine.token1,
          1,
          lendgineInfo[2].toString()
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

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  const positionQuery = useLiquidityManagerPositions({
    address: environment.base.liquidityManager,
    args: address && lendgine ? [address, lendgine.address] : undefined,
    watch: true,
    staleTime: Infinity,
    enabled: !!lendgine && !!address,
  });

  // This function should be generalized to take the FetchBalanceResult type and then parsing it
  // parse the return type into a more expressive type
  const parseReturn = (
    position: (typeof positionQuery)["data"]
  ): LendginePosition<L> | undefined => {
    if (!position) return undefined;
    invariant(lendgine && address); // if a balance is returned then the data passed must be valid
    return {
      size: CurrencyAmount.fromRawAmount(
        lendgine.lendgine,
        position.size.toString()
      ),
      rewardPerPositionPaid: new Price(
        lendgine.lendgine,
        lendgine.token1,
        1,
        position.rewardPerPositionPaid.toString()
      ),
      tokensOwed: CurrencyAmount.fromRawAmount(
        lendgine.token1,
        position.tokensOwed.toString()
      ),
    };
  };

  // This could be generalized into a function
  // update the query with the parsed data type
  const updatedQuery = {
    ...positionQuery,
    data: parseReturn(positionQuery.data),
    refetch: async (
      options: Parameters<(typeof positionQuery)["refetch"]>[0]
    ) => {
      const balance = await positionQuery.refetch(options);
      return parseReturn(balance.data);
    },
  };

  return updatedQuery;
};

export const useLendginesPosition = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  const contracts =
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
      : undefined;

  const positionsQuery = useContractReads({
    contracts,
    watch: true,
    staleTime: Infinity,
    allowFailure: false,
    enabled: !!contracts,
  });

  // This function should be generalized to take the FetchBalanceResult type and then parsing it
  // parse the return type into a more expressive type
  const parseReturn = (
    positions: (typeof positionsQuery)["data"]
  ): LendginePosition<L>[] | undefined => {
    if (!positions) return undefined;
    invariant(lendgines && address); // if a balance is returned then the data passed must be valid
    return positions.map((p, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      return {
        size: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          p.size.toString()
        ),
        rewardPerPositionPaid: new Price(
          lendgine.lendgine,
          lendgine.token1,
          1,
          p.rewardPerPositionPaid.toString()
        ),
        tokensOwed: CurrencyAmount.fromRawAmount(
          lendgine.token1,
          p.tokensOwed.toString()
        ),
      };
    });
  };

  // This could be generalized into a function
  // update the query with the parsed data type
  const updatedQuery = {
    ...positionsQuery,
    data: parseReturn(positionsQuery.data),
    refetch: async (
      options: Parameters<(typeof positionsQuery)["refetch"]>[0]
    ) => {
      const balance = await positionsQuery.refetch(options);
      return parseReturn(balance.data);
    },
  };

  return updatedQuery;
};
