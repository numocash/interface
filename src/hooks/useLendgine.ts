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
} from "../contexts/environment";
import { GENESIS, LIQUIDITYMANAGER } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { blockHistory, useBlockQuery } from "./useBlockQuery";
import { lendgineInterface, useLiquidityManager } from "./useContract";

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

  const data = useBlockQuery("user lp positions", calls, [
    market?.address,
    address,
  ]);
  if (tokenIDs === []) return [];
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
  };
};
