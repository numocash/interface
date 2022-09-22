import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment";
import { useApproval } from "../../../hooks/useApproval";
import { useTokenBalance } from "../../../hooks/useTokenBalance";
import { useBeet } from "../../../utils/beet";
import type { Trade } from "./useSwapState";

export interface UseTradeParams {
  fromAmount?: TokenAmount;
  fromToken?: Token;
  toToken?: Token;
}

export type ITradeCallback = () => void;

/**
 * Allows performing a trade
 */
export const useTrade = ({
  fromAmount,
  fromToken,
  toToken,
}: UseTradeParams): {
  swapDisabledReason: string | null;
  handleTrade: ITradeCallback;
  trade: Trade | null;
} => {
  const { address } = useAccount();
  const beet = useBeet();

  const userFromBalance = useTokenBalance(fromToken ?? null, address ?? null);

  const { markets } = useEnvironment();

  const approval = useApproval(fromAmount, address, markets[0]?.address);

  // const trade =
  //   fromAmount && toToken && fromToken
  //     ? {
  //         input: fromAmount,
  //         output: new TokenAmount(toToken, 0),
  //         fee: new TokenAmount(fromToken, 0),
  //         minimumOutput: new TokenAmount(toToken, 0),
  //       }
  //     : null;
  const trade = null;

  const handleTrade = useCallback(() => {
    console.log("trade");
  }, []);

  const swapDisabledReason = useMemo(
    () =>
      !fromToken
        ? "Select input token"
        : !toToken
        ? "Select output token"
        : !fromAmount || fromAmount.equalTo(0)
        ? "Enter an amount"
        : !userFromBalance || approval === null
        ? "Loading"
        : fromAmount.greaterThan(userFromBalance)
        ? "Insufficient tokens"
        : null,
    [fromAmount, fromToken, toToken, userFromBalance, approval]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};
