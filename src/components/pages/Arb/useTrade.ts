import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { useCallback, useMemo } from "react";

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
}: UseTradeParams): {
  swapDisabledReason: string | null;
  handleTrade: ITradeCallback;
  trade: Trade;
} => {
  const trade = useMemo(
    () => ({
      zero: true,
      inputAmount: fromAmount,
      outputAmount: new TokenAmount(toToken, fromAmount.raw),
    }),
    [fromAmount, toToken]
  );

  const handleTrade = useCallback(() => {
    console.log("free money");
  }, []);

  const swapDisabledReason = useMemo(
    () => (!fromAmount || fromAmount.equalTo(0) ? "Enter an amount" : null),
    [fromAmount]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};
