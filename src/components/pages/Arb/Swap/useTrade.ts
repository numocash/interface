import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { Arbitrage } from "../../../../generated/Arbitrage";
import { useArbitrageContract } from "../../../../hooks/useContract";
import { usePair } from "../../../../hooks/usePair";
import { useUniswapPair } from "../../../../hooks/useUniswapPair";
import { useBeet } from "../../../../utils/beet";
import { getBaseIn, getBaseOut } from "../../../../utils/Numoen/pairMath";
import { getAmountIn } from "../../../../utils/Numoen/uniPairMath";
import { scale } from "../../Trade/useTrade";
import type { Trade } from "./useArbState";

export interface UseTradeParams {
  market: IMarket;
  fromAmount: TokenAmount;
  fromToken: Token;
  toToken: Token;
}

export type ITradeCallback = () => Promise<void> | void;

/**
 * Allows performing a trade
 */
export const useTrade = ({
  fromAmount,
  toToken,
  market,
}: UseTradeParams): {
  swapDisabledReason: string | null;
  handleTrade: ITradeCallback;
  trade: Trade | null;
} => {
  const arb0 = useArb0(fromAmount, market);
  const arb1 = useArb1(fromAmount, market);

  const arbContract = useArbitrageContract(true);
  const { address } = useAccount();
  const beet = useBeet();

  const trade = useMemo(() => {
    const zero = toToken === market.pair.baseToken;
    if (!arb0 || !arb1) return null;

    return {
      zero,
      inputAmount: fromAmount,
      outputAmount: zero ? arb0 : arb1,
    };
  }, [arb0, arb1, fromAmount, market.pair.baseToken, toToken]);

  const handleTrade = useCallback(async () => {
    invariant(arbContract && address);

    const arbParams: Omit<Arbitrage.ArbParamsStruct, "recipient"> = {
      base: market.pair.baseToken.address,
      speculative: market.pair.speculativeToken.address,
      baseScaleFactor: market.pair.baseScaleFactor,
      speculativeScaleFactor: market.pair.speculativeScaleFactor,
      upperBound: market.pair.bound.asFraction
        .multiply(scale)
        .quotient.toString(),
      arbAmount: fromAmount.raw.toString(),
    };

    await beet("Arbitrage", [
      {
        stageTitle: `Arbitrage`,
        parallelTransactions: [
          {
            title: `Arbitrage`,
            description: `Arbitrage ${market.token.symbol} pair with Uniswap`,
            txEnvelope: () =>
              toToken === market.pair.baseToken
                ? arbContract.arb0({ ...arbParams, recipient: address })
                : arbContract.arb1({ ...arbParams, recipient: address }),
          },
        ],
      },
    ]);
  }, [
    address,
    arbContract,
    beet,
    fromAmount.raw,
    market.pair.baseScaleFactor,
    market.pair.baseToken,
    market.pair.bound.asFraction,
    market.pair.speculativeScaleFactor,
    market.pair.speculativeToken.address,
    market.token.symbol,
    toToken,
  ]);

  const swapDisabledReason = useMemo(
    () =>
      !fromAmount || fromAmount.equalTo(0)
        ? "Enter an amount"
        : !trade
        ? "Loading"
        : trade.outputAmount.lessThan(0)
        ? "No arbitrage opportunity"
        : null,
    [fromAmount, trade]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};

const useArb0 = (
  fromAmount: TokenAmount,
  market: IMarket
): TokenAmount | null => {
  const pairInfo = usePair(market.pair);
  const uniInfo = useUniswapPair(market);

  return useMemo(() => {
    const amountOutNumoen = pairInfo
      ? getBaseOut(
          fromAmount,
          pairInfo.speculativeAmount,
          pairInfo.totalLPSupply,
          market
        )
      : null;

    // amountOutNumoen &&
    //   pairInfo &&
    //   console.log(
    //     getSpeculativeIn(
    //       amountOutNumoen,
    //       pairInfo.speculativeAmount,
    //       pairInfo.totalLPSupply,
    //       market
    //     ).raw.toString()
    //   );

    const amountInUniswap = uniInfo
      ? getAmountIn(fromAmount, uniInfo[0], uniInfo[1])
      : null;
    return amountOutNumoen && amountInUniswap
      ? amountOutNumoen.subtract(amountInUniswap)
      : null;
  }, [fromAmount, market, pairInfo, uniInfo]);
};

const useArb1 = (
  fromAmount: TokenAmount,
  market: IMarket
): TokenAmount | null => {
  const pairInfo = usePair(market.pair);
  const uniInfo = useUniswapPair(market);

  return useMemo(() => {
    const amountInNumoen = pairInfo
      ? getBaseIn(
          fromAmount,
          pairInfo.speculativeAmount,
          pairInfo.totalLPSupply,
          market
        )
      : null;

    // amountInNumoen &&
    //   pairInfo &&
    //   console.log(
    //     getSpeculativeOut(
    //       amountInNumoen,
    //       pairInfo.speculativeAmount,
    //       pairInfo.totalLPSupply,
    //       market
    //     ).raw.toString()
    //   );

    const amountInUniswap =
      uniInfo && amountInNumoen
        ? getAmountIn(amountInNumoen, uniInfo[1], uniInfo[0])
        : null;

    return amountInUniswap ? fromAmount.subtract(amountInUniswap) : null;
  }, [fromAmount, market, pairInfo, uniInfo]);
};
