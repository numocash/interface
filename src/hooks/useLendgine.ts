import type { IMarket, IMarketInfo } from "@dahlia-labs/numoen-utils";
import {
  getPositionMulticall,
  lastUpdateMulticall,
  rewardPerLiquidityStoredMulticall,
  totalLiquidityBorrowedMulticall,
  totalLiquidityMulticall,
} from "@dahlia-labs/numoen-utils";
import type { TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction, Price } from "@dahlia-labs/token-utils";
import { totalSupplyMulticall } from "@dahlia-labs/use-ethers";
import { max } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { pairInfoToPrice } from "../components/pages/Earn/PositionCard/Stats";
import { useBlock } from "../contexts/block";
import type { IMarketUserInfo } from "../contexts/environment";
import { GENESIS } from "../contexts/environment";
import { getPositionMulticall2 } from "../utils/lendgineUtils";
import { newRewardPerLiquidity } from "../utils/trade";
import { useBlockMulticall, useBlockQuery } from "./useBlockQuery";
import { useLiquidityManager } from "./useContract";
import { usePair } from "./usePair";
import { useUniswapPair } from "./useUniswapPair";

export const useUserLendgines = (
  address: string | undefined,
  markets: readonly IMarket[] | null
): readonly IMarketUserInfo[] | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);

  const mintFilter = liquidityManagerContract.filters.Mint(address);

  const filteredEvents = useBlockQuery(
    ["mint events", address],
    async () => await liquidityManagerContract.queryFilter(mintFilter, GENESIS),
    !!address && !!markets
  );

  const tokenIDs = filteredEvents?.data?.map((d) => +d.args[1].toString());

  const data = useBlockMulticall(
    markets && tokenIDs
      ? tokenIDs.map((t) => getPositionMulticall2(t, markets))
      : null
  );
  if (!data) return null;

  return data;
};

export const useNextTokenID = (): number | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);

  const mintFilter = liquidityManagerContract.filters.Mint();
  const { blocknumber } = useBlock();

  const filteredEvents = useBlockQuery(
    ["next token id"],
    async () =>
      await liquidityManagerContract.queryFilter(
        mintFilter,
        GENESIS,
        blocknumber ?? undefined
      ),
    true
  );

  const tokenIDs = filteredEvents?.data?.map((d) => +d.args[1].toString());
  if (tokenIDs && tokenIDs.length === 0) return 0;
  return tokenIDs ? max(tokenIDs) ?? null : null;
};

export const useUserLendgine = (
  tokenID: number | null,
  market: IMarket | null
): IMarketUserInfo | null => {
  const data = useBlockMulticall(
    tokenID && market ? [getPositionMulticall(tokenID, market)] : null
  );

  if (!data) return null;
  return data[0];
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
