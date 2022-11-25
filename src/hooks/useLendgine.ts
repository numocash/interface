import type { IMarket, IMarketInfo } from "@dahlia-labs/numoen-utils";
import {
  lastUpdateMulticall,
  LIQUIDITYMANAGER,
  rewardPerLiquidityStoredMulticall,
  totalLiquidityBorrowedMulticall,
  totalLiquidityMulticall,
} from "@dahlia-labs/numoen-utils";
import { Fraction, Price, TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { totalSupplyMulticall } from "@dahlia-labs/use-ethers";
import type { BigNumber } from "@ethersproject/bignumber";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { max } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { pairInfoToPrice } from "../components/pages/Earn/PositionCard/Stats";
import { useBlock } from "../contexts/block";
import type { IMarketUserInfo } from "../contexts/environment";
import { GENESIS } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { newRewardPerLiquidity } from "../utils/trade";
import {
  blockHistory,
  useBlockMulticall,
  useBlockQuery,
} from "./useBlockQuery";
import { useLiquidityManager } from "./useContract";
import { lendgineAddress } from "./useLendgineAddress";
import { usePair } from "./usePair";
import { useUniswapPair } from "./useUniswapPair";

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
    rewardPerLiquidityPaid: BigNumber;
    tokensOwed: BigNumber;
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
      rewardPerLiquidityPaid: new TokenAmount(
        market.pair.speculativeToken,
        ret.rewardPerLiquidityPaid.toString()
      ),
      tokensOwed: new TokenAmount(
        market.pair.speculativeToken,
        ret.rewardPerLiquidityPaid.toString()
      ),
    };
  });
};

export const useNextTokenID = (): number | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);

  const mintFilter = liquidityManagerContract.filters.Mint();
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
  if (tokenIDs && tokenIDs.length === 0) return 0;
  return tokenIDs ? max(tokenIDs) ?? null : null;
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
    rewardPerLiquidityPaid: BigNumber;
    tokensOwed: BigNumber;
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
    rewardPerLiquidityPaid: new TokenAmount(
      market.pair.speculativeToken,
      ret.rewardPerLiquidityPaid.toString()
    ),
    tokensOwed: new TokenAmount(
      market.pair.speculativeToken,
      ret.rewardPerLiquidityPaid.toString()
    ),
  };
};

export const useLendgine = (market: IMarket | null): IMarketInfo | null => {
  const data = useBlockMulticall(
    market
      ? [
          totalLiquidityMulticall(market),
          totalLiquidityBorrowedMulticall(market),
          rewardPerLiquidityStoredMulticall(market),
          totalSupplyMulticall(market.token),
          lastUpdateMulticall(market),
        ]
      : null
  );

  if (!data) return null;

  return {
    totalLiquidity: data[0],
    totalLiquidityBorrowed: data[1],
    rewardPerLiquidityStored: data[2],
    totalSupply: data[3],
    lastUpdate: data[4],
  };
};

export const usePrice = (market: IMarket | null): Fraction | null => {
  const pairInfo = usePair(market?.pair ?? null);
  const uniInfo = useUniswapPair(market ?? null);

  if ((!pairInfo && !uniInfo) || !market) return null;
  if (pairInfo && pairInfo.totalLPSupply.greaterThan(0)) {
    return pairInfoToPrice(pairInfo, market.pair);
  } else {
    if (!uniInfo) return null;
    const s = new Fraction(10 ** 4);
    const price = new Price(
      market.pair.speculativeToken,
      market.pair.baseToken,
      uniInfo[1].raw,
      uniInfo[0].raw
    );

    return new Fraction(price.asFraction.multiply(s).quotient, 10 ** 4);
  }
};

export const useRefPrice = (market: IMarket | null): Price | null => {
  const uniInfo = useUniswapPair(market ?? null);

  if (!uniInfo || !market) return null;

  return new Price(
    market.pair.speculativeToken,
    market.pair.baseToken,
    uniInfo[1].raw,
    uniInfo[0].raw
  );
};

export const useClaimableTokens = (
  tokenID: number | null,
  market: IMarket
): TokenAmount | null => {
  const marketInfo = useLendgine(market);
  const newRPL = useMemo(
    () => (marketInfo ? newRewardPerLiquidity(market, marketInfo) : null),
    [market, marketInfo]
  );
  const userPositionInfo = useUserLendgine(tokenID, market);

  return useMemo(() => {
    const rpl =
      newRPL && userPositionInfo && marketInfo
        ? newRPL
            .add(marketInfo.rewardPerLiquidityStored)
            .subtract(userPositionInfo.rewardPerLiquidityPaid)
        : null;
    const tokensOwed =
      rpl && userPositionInfo ? rpl.scale(userPositionInfo.liquidity) : null;
    return tokensOwed && userPositionInfo
      ? tokensOwed.add(userPositionInfo.tokensOwed)
      : null;
  }, [marketInfo, newRPL, userPositionInfo]);
};
