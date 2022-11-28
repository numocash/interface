import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Price, Token } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import { useCallback, useMemo } from "react";

import { usePair } from "../../../hooks/usePair";
import { useUniswapPair } from "../../../hooks/useUniswapPair";
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

  const trade = useMemo(() => {
    const zero = toToken === market.pair.baseToken;
    if (!arb0 || !arb1) return null;

    return {
      zero,
      inputAmount: fromAmount,
      outputAmount: zero ? arb0 : arb1,
    };
  }, [arb0, arb1, fromAmount, market.pair.baseToken, toToken]);

  const handleTrade = useCallback(() => {
    console.log("free money");
  }, []);

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
          market.pair.bound,
          market
        )
      : null;

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
          market.pair.bound,
          market
        )
      : null;

    const amountInUniswap =
      uniInfo && amountInNumoen
        ? getAmountIn(amountInNumoen, uniInfo[1], uniInfo[0])
        : null;

    return amountInUniswap ? fromAmount.subtract(amountInUniswap) : null;
  }, [fromAmount, market, pairInfo, uniInfo]);
};

const getBaseOut = (
  amountSIn: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  upperBound: Price,
  market: IMarket
): TokenAmount => {
  const scaleIn = amountSIn.scale(liquidity.invert());
  const scale1 = r1.scale(liquidity.invert());

  const a = scaleIn.scale(upperBound.asFraction);
  const b = scaleIn.scale(scaleIn).scale(new Fraction(4).invert());
  const c = scaleIn.scale(scale1).scale(new Fraction(2).invert());

  return new TokenAmount(
    market.pair.baseToken,
    a.subtract(b).subtract(c).scale(liquidity).raw
  );
};

const getBaseIn = (
  amountSOut: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  upperBound: Price,
  market: IMarket
): TokenAmount => {
  const scaleOut = amountSOut.scale(liquidity.invert());
  const scale1 = r1.scale(liquidity.invert());

  const a = scaleOut.scale(upperBound.asFraction);
  const b = scaleOut.scale(scaleOut).scale(new Fraction(4).invert());
  const c = scaleOut.scale(scale1).scale(new Fraction(2).invert());

  return new TokenAmount(
    market.pair.baseToken,
    a.add(b).subtract(c).scale(liquidity).raw
  );
};

const getAmountOut = (
  amountIn: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const amountInWithFee = amountIn.scale(new Fraction(997));
  const numerator = amountInWithFee.scale(reserveOut);
  const denominator = reserveIn.scale(new Fraction(1000)).add(amountInWithFee);
  return new TokenAmount(
    reserveOut.token,
    numerator.scale(denominator.invert()).raw
  );
};

const getAmountIn = (
  amountOut: TokenAmount,
  reserveIn: TokenAmount,
  reserveOut: TokenAmount
): TokenAmount => {
  const numerator = reserveIn.scale(amountOut).scale(new Fraction(1000));
  const denominator = reserveOut.subtract(amountOut).scale(new Fraction(997));
  return new TokenAmount(
    reserveIn.token,
    numerator.scale(denominator.invert()).raw
  );
};
