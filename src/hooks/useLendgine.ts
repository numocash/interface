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
import { lendgineAddress } from "./useLendgineAddress";

export const useUserLendgines = (
  address: string | undefined,
  markets: readonly IMarket[] | null
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
  if (
    !address ||
    !data ||
    !markets ||
    !tokenIDs ||
    data.returnData.length !== tokenIDs.length
  )
    return null;

  interface LendgineRet {
    liquidity: BigNumber;
    base: BigNumber;
    speculative: BigNumber;
    baseScaleFactor: BigNumber;
    speculativeScaleFactor: BigNumber;
    upperBound: BigNumber;
  }

  return tokenIDs.map((t, i) => {
    const ret = parseFunctionReturn(
      liquidityManagerContract.interface,
      "getPosition",
      data.returnData[i]
    ) as unknown as LendgineRet;

    const market = lendgineAddress(
      {
        base: ret.base.toString(),
        speculative: ret.speculative.toString(),
        baseScaleFactor: +ret.baseScaleFactor.toString(),
        speculativeScaleFactor: +ret.speculativeScaleFactor.toString(),
        upperBound: ret.upperBound.toString(),
      },
      markets
    );

    invariant(market, "unable to find market");

    return {
      tokenID: t,
      market,
      liquidity: new TokenAmount(market.pair.lp, ret.liquidity.toString()),
    };
  });
};

export const useUserLendgine = (
  tokenID: number | null,
  market: IMarket | null
): IMarketUserInfo | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);

  const call: Call = {
    target: LIQUIDITYMANAGER,
    callData: liquidityManagerContract.interface.encodeFunctionData(
      "getPosition",
      [tokenID ?? 0]
    ),
  };
  const data = useBlockQuery("tokenID position", [call]);

  if (!tokenID || !data || !market) return null;

  interface LendgineRet {
    liquidity: BigNumber;
  }

  const ret = parseFunctionReturn(
    liquidityManagerContract.interface,
    "getPosition",
    data.returnData[0]
  ) as unknown as LendgineRet;

  return {
    tokenID,
    market,
    liquidity: new TokenAmount(market.pair.lp, ret.liquidity.toString()),
  };
};

export const useLendgine = (market: IMarket): IMarketInfo | null => {
  const calls: Call[] = [
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalLiquidity"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalLiquidityBorrowed"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData(
        "rewardPerLiquidityStored"
      ),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalSupply"),
    },
    {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("lastUpdate"),
    },
  ];

  const data = useBlockQuery("lendgine", calls, [market.address]);
  if (!data) return null;

  return {
    totalLiquidity: new TokenAmount(
      market.pair.lp,
      parseFunctionReturn(
        lendgineInterface,
        "totalLiquidity",
        data.returnData[0]
      ).toString()
    ),
    totalLiquidityBorrowed: new TokenAmount(
      market.pair.lp,
      parseFunctionReturn(
        lendgineInterface,
        "totalLiquidityBorrowed",
        data.returnData[1]
      ).toString()
    ),
    rewardPerLiquidityStored: new TokenAmount(
      market.pair.speculativeToken,
      parseFunctionReturn(
        lendgineInterface,
        "rewardPerLiquidityStored",
        data.returnData[2]
      ).toString()
    ),
    totalSupply: new TokenAmount(
      market.token,
      parseFunctionReturn(
        lendgineInterface,
        "totalSupply",
        data.returnData[3]
      ).toString()
    ),
    lastUpdate: +parseFunctionReturn(
      lendgineInterface,
      "lastUpdate",
      data.returnData[4]
    ).toString(),
  };
};
