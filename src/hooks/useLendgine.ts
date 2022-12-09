import type {
  IMarket,
  IMarketInfo,
  IMarketUserInfo,
} from "@dahlia-labs/numoen-utils";
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
import JSBI from "jsbi";
import { max } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { scale } from "../components/pages/Trade/useTrade";
import { liquidityManagerGenesis } from "../constants";
import { useBlock } from "../contexts/block";
import { useAddressToMarket } from "../contexts/environment";
import { scaleFactor } from "../utils/Numoen/invariantMath";
import {
  convertShareToLiquidity,
  liquidityToSpeculative,
  newRewardPerLiquidity,
} from "../utils/Numoen/lendgineMath";
import { getPositionMulticall2 } from "../utils/Numoen/lendgineMulticall";
import { pairInfoToPrice, pricePerLP } from "../utils/Numoen/priceMath";
import type { HookArg } from "./useApproval";
import { useBlockMulticall, useBlockQuery } from "./useBlockQuery";
import { useChain } from "./useChain";
import { useLiquidityManager } from "./useContract";
import { usePair } from "./usePair";
import { useUniswapPair } from "./useUniswapPair";

export const useUserLendgines = (
  address: HookArg<string>,
  markets: HookArg<readonly IMarket[]>
): readonly IMarketUserInfo[] | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  const chain = useChain();

  invariant(liquidityManagerContract);

  const mintFilter = liquidityManagerContract.filters.Mint(address);

  const filteredEvents = useBlockQuery(
    ["mint events", address],
    async () =>
      await liquidityManagerContract.queryFilter(
        mintFilter,
        liquidityManagerGenesis[chain]
      ),
    !!address && !!markets
  );

  const tokenIDs = filteredEvents?.data?.map((d) => +d.args[1].toString());

  const data = useBlockMulticall(
    markets && tokenIDs
      ? tokenIDs.map((t) => getPositionMulticall2(t, markets, chain))
      : null
  );
  if (!data) return null;

  return data.filter((m) => m !== null) as IMarketUserInfo[];
};

export const useNextTokenID = (): number | null => {
  const liquidityManagerContract = useLiquidityManager(false);
  invariant(liquidityManagerContract);

  const mintFilter = liquidityManagerContract.filters.Mint();
  const { blocknumber } = useBlock();
  const chain = useChain();

  const filteredEvents = useBlockQuery(
    ["next token id"],
    async () =>
      await liquidityManagerContract.queryFilter(
        mintFilter,
        liquidityManagerGenesis[chain],
        blocknumber ?? undefined
      ),
    true
  );

  const tokenIDs = filteredEvents?.data?.map((d) => +d.args[1].toString());
  if (tokenIDs && tokenIDs.length === 0) return 0;
  return tokenIDs ? max(tokenIDs) ?? null : null;
};

export const useUserLendgine = (
  tokenID: HookArg<number>,
  market: HookArg<IMarket>
): IMarketUserInfo | null => {
  const chain = useChain();

  const data = useBlockMulticall(
    tokenID && market ? [getPositionMulticall(tokenID, market, chain)] : null
  );

  if (!data) return null;
  return data[0];
};

export const useLendgine = (market: HookArg<IMarket>): IMarketInfo | null => {
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

export const usePrice = (market: HookArg<IMarket>): Fraction | null => {
  const pairInfo = usePair(market?.pair ?? null);
  const uniInfo = useUniswapPair(market ?? null);

  if ((!pairInfo && !uniInfo) || !market) return null;
  if (pairInfo && pairInfo.totalLPSupply.greaterThan(0)) {
    return pairInfoToPrice(pairInfo, market.pair);
  } else {
    if (!uniInfo) return null;
    const s = new Fraction(10 ** 9);
    const price = new Price(
      market.pair.speculativeToken,
      market.pair.baseToken,
      JSBI.divide(
        JSBI.multiply(uniInfo[1].raw, scale.quotient),
        scaleFactor(market.pair.speculativeScaleFactor)
      ),
      JSBI.divide(
        JSBI.multiply(uniInfo[0].raw, scale.quotient),
        scaleFactor(market.pair.baseScaleFactor)
      )
    );

    return new Fraction(price.asFraction.multiply(s).quotient, 10 ** 9);
  }
};

export const useRefPrice = (market: HookArg<IMarket>): Price | null => {
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
  tokenID: HookArg<number>,
  market: HookArg<IMarket>
): TokenAmount | null => {
  const marketInfo = useLendgine(market);
  const newRPL = useMemo(
    () =>
      marketInfo && market ? newRewardPerLiquidity(market, marketInfo) : null,
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

export const usePositionValue = (
  position: HookArg<TokenAmount>
): TokenAmount | null => {
  const market = useAddressToMarket(position?.token.address);
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market?.pair);
  const price = usePrice(market);
  useMemo(() => {
    const liquidity =
      market && marketInfo && position
        ? convertShareToLiquidity(position, market, marketInfo)
        : null;
    const specCollateral =
      liquidity && market ? liquidityToSpeculative(liquidity, market) : null;

    const collateralValue =
      specCollateral && price ? specCollateral.multiply(price) : null;
    const pricePerLiquidity =
      pairInfo && market ? pricePerLP(pairInfo, market?.pair) : null;
    const debtValue =
      liquidity && pricePerLiquidity
        ? liquidity.multiply(pricePerLiquidity.asFraction)
        : null;

    const value =
      collateralValue && debtValue ? collateralValue.subtract(debtValue) : null;

    console.log(value?.toSignificant(6));
  }, [market, marketInfo, pairInfo, position, price]);
  if (!market) return null;
  return null;
};
