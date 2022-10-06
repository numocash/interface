import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import type { BigNumber } from "@ethersproject/bignumber";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import invariant from "tiny-invariant";

import { useBlock } from "../contexts/block";
import type {
  IMarket,
  IMarketInfo,
  IMarketUserInfo,
  ITickInfo,
} from "../contexts/environment";
import { GENESIS, LIQUIDITYMANAGER } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { blockHistory, useBlockQuery } from "./useBlockQuery";
import {
  lendgineInterface,
  useLendgineContract,
  useLiquidityManager,
} from "./useContract";

export const useUserLendgine = (
  address: string | undefined,
  market: IMarket | null
): IMarketUserInfo[] | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);
  const mintFilter = liquidityManagerContract.filters.Mint(address);
  const { blocknumber } = useBlock();
  const queryClient = useQueryClient();

  const filteredEvents = useQuery(
    ["mint events", blocknumber ?? 0],
    async () =>
      await liquidityManagerContract.queryFilter(
        mintFilter,
        GENESIS,
        blocknumber ?? undefined
      ),
    {
      staleTime: Infinity,
      placeholderData: blocknumber
        ? [...Array(blockHistory).keys()]
            .map((i) => blocknumber - i - 1)
            .reduce((acc, cur: number) => {
              return acc ? acc : queryClient.getQueryData(["mint events", cur]);
            }, undefined) ?? queryClient.getQueryData(["mint events", 0])
        : undefined,
    }
  );

  const tokenIDs = filteredEvents?.data?.map((d) => +d.args[1].toString());

  const calls: Call[] = tokenIDs
    ? tokenIDs.map((t) => ({
        target: LIQUIDITYMANAGER,
        callData: liquidityManagerContract.interface.encodeFunctionData(
          "getPosition",
          [t]
        ),
      }))
    : [];

  const data = useBlockQuery("user lp positions", calls);
  if (tokenIDs === [] || !address) return [];
  if (
    !data ||
    !market ||
    !tokenIDs ||
    data.returnData.length !== tokenIDs.length
  )
    return null;

  interface LendgineRet {
    liquidity: BigNumber;
    tick: BigNumber;
  }

  return tokenIDs.map((t, i) => {
    const ret = parseFunctionReturn(
      liquidityManagerContract.interface,
      "getPosition",
      data.returnData[i]
    ) as unknown as LendgineRet;

    return {
      tick: +ret.tick.toString(),
      tokenID: t,
      liquidity: new TokenAmount(market.pair.lp, ret.liquidity.toString()),
    };
  });
};

export const useLendgine = (market: IMarket): IMarketInfo | null => {
  const calls: Call[] = [
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("currentTick"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("currentLiquidity"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("interestNumerator"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalLiquidityBorrowed"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalSupply"),
    },
  ];

  const data = useBlockQuery("lendgine", calls, [market.address]);
  if (!data) return null;

  return {
    currentTick: +parseFunctionReturn(
      lendgineInterface,
      "currentTick",
      data.returnData[0]
    ).toString(),
    currentLiquidity: new TokenAmount(
      market.pair.lp,
      parseFunctionReturn(
        lendgineInterface,
        "currentLiquidity",
        data.returnData[1]
      ).toString()
    ),
    interestNumerator: new TokenAmount(
      market.pair.lp,
      parseFunctionReturn(
        lendgineInterface,
        "interestNumerator",
        data.returnData[2]
      ).toString()
    ),
    totalLiquidityBorrowed: new TokenAmount(
      market.pair.lp,
      parseFunctionReturn(
        lendgineInterface,
        "totalLiquidityBorrowed",
        data.returnData[3]
      ).toString()
    ),
    totalSupply: new TokenAmount(
      market.token,
      parseFunctionReturn(
        lendgineInterface,
        "totalSupply",
        data.returnData[4]
      ).toString()
    ),
  };
};

export const useTick = (
  market: IMarket,
  tick: number | null
): ITickInfo | null => {
  const calls: Call[] = [
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("ticks", [tick ?? 0]),
    },
  ];

  const data = useBlockQuery("tick", calls);
  if (!data || !tick) return null;

  interface TicksRet {
    liquidity: BigNumber;
  }

  const tickData = parseFunctionReturn(
    lendgineInterface,
    "ticks",
    data.returnData[0]
  ) as unknown as TicksRet;

  return {
    tick,
    liquidity: new TokenAmount(market.pair.lp, tickData.liquidity.toString()),
  };
};

export const useTicks = (market: IMarket): ITickInfo[] | null => {
  const lendgineContract = useLendgineContract(market.address, false);
  invariant(lendgineContract);

  const mintFilter = lendgineContract.filters.MintMaker();
  const { blocknumber } = useBlock();
  const queryClient = useQueryClient();

  const filteredEvents = useQuery(
    ["mintmaker", blocknumber ?? 0],
    async () =>
      await lendgineContract.queryFilter(
        mintFilter,
        GENESIS,
        blocknumber ?? undefined
      ),
    {
      staleTime: Infinity,
      placeholderData: blocknumber
        ? [...Array(blockHistory).keys()]
            .map((i) => blocknumber - i - 1)
            .reduce((acc, cur: number) => {
              return acc ? acc : queryClient.getQueryData(["mintmaker", cur]);
            }, undefined) ?? queryClient.getQueryData(["mintmaker", 0])
        : undefined,
    }
  );

  const allTicks = filteredEvents.data?.map((d) => d.args.tick as number);

  const seen = new Set<number>();
  const dedupedTicks = allTicks?.filter((t) => {
    if (seen.has(t)) {
      return false;
    } else {
      seen.add(t);
      return true;
    }
  });

  const sortedTicks = dedupedTicks?.sort((a: number, b: number) =>
    a > b ? 1 : -1
  );

  const calls: Call[] =
    sortedTicks?.map((t) => ({
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("ticks", [t]),
    })) ?? [];

  const data = useBlockQuery("all ticks", calls, [market.address, sortedTicks]);
  if (!data || !sortedTicks) return null;
  interface TicksRet {
    liquidity: BigNumber;
  }

  return sortedTicks.map((t, i) => {
    const tickData = parseFunctionReturn(
      lendgineInterface,
      "ticks",
      data.returnData[i]
    ) as unknown as TicksRet;

    return {
      tick: t,
      liquidity: new TokenAmount(market.pair.lp, tickData.liquidity.toString()),
    };
  });
};
