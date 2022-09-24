import type { Token } from "@dahlia-labs/token-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
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
export const scale = new Fraction(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
);

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

  const market = markets[0];

  const trade =
    fromAmount && toToken && fromToken && market
      ? {
          input: fromAmount,
          output: new TokenAmount(
            toToken,
            fromAmount.token === market.pair.speculativeToken
              ? fromAmount.multiply(scale).divide(10).quotient.toString()
              : fromAmount.multiply(scale).multiply(10).quotient.toString()
          ),
          fee: new TokenAmount(fromToken, 0),
          minimumOutput: new TokenAmount(toToken, 0),
          market,
        }
      : null;

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
