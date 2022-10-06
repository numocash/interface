import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction, Percent } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { LENDGINEROUTER, useEnvironment } from "../../../contexts/environment";
import { useSettings } from "../../../contexts/settings";
import { useApproval, useApprove } from "../../../hooks/useApproval";
import { useLendgineRouter } from "../../../hooks/useContract";
import { useLendgine } from "../../../hooks/useLendgine";
import { useTokenBalance } from "../../../hooks/useTokenBalance";
import type { BeetStage, BeetTx } from "../../../utils/beet";
import { useBeet } from "../../../utils/beet";
import { outputAmount } from "../../../utils/trade";
import type { Trade } from "./useSwapState";

export interface UseTradeParams {
  fromAmount?: TokenAmount;
  fromToken?: Token;
  toToken?: Token;
}
export const scale = new Fraction(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
);

export type ITradeCallback = () => Promise<void>;

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
  const settings = useSettings();

  const lengineRouterContract = useLendgineRouter(true);

  const userFromBalance = useTokenBalance(fromToken ?? null, address ?? null);

  const { markets } = useEnvironment();

  const market = markets[0];
  invariant(market);
  const marketInfo = useLendgine(market);

  const approval = useApproval(fromAmount, address, LENDGINEROUTER);
  const approve = useApprove(fromAmount, LENDGINEROUTER);

  const trade =
    fromAmount && toToken && fromToken && market && marketInfo
      ? {
          market,
          mint: fromAmount.token === market.pair.speculativeToken,
          inputAmount: fromAmount,
          ...outputAmount(market, marketInfo, fromAmount),
        }
      : null;

  const baseApproval = useApproval(
    trade?.baseAmount.scale(
      settings.maxSlippagePercent.add(Percent.ONE_HUNDRED)
    ),
    address,
    LENDGINEROUTER
  );
  const baseApprove = useApprove(
    trade?.baseAmount.scale(
      settings.maxSlippagePercent.add(Percent.ONE_HUNDRED)
    ),
    LENDGINEROUTER
  );

  const handleTrade = useCallback(async () => {
    invariant(lengineRouterContract && address && trade);

    const approveStage: BeetStage[] =
      approval || (!trade?.mint && baseApproval)
        ? [
            {
              stageTitle: "Approve tokens",
              parallelTransactions: [
                approval
                  ? {
                      title: "Approve",
                      description: `Approve ${
                        fromAmount?.toFixed(2, {
                          groupSeparator: ",",
                        }) ?? ""
                      } ${fromToken?.symbol ?? ""}`,
                      txEnvelope: approve,
                    }
                  : null,
                !trade?.mint && baseApproval
                  ? {
                      title: "Approve",
                      description: `Approve ${trade?.baseAmount.toFixed(2, {
                        groupSeparator: ",",
                      })} ${trade?.market.pair.baseToken.symbol}`,
                      txEnvelope: baseApprove,
                    }
                  : null,
              ].filter((t) => t !== null) as BeetTx[],
            },
          ]
        : [];

    trade.mint
      ? await beet(
          "Buy option",
          approveStage.concat([
            {
              stageTitle: "Buy option",
              parallelTransactions: [
                {
                  title: "Buy option",
                  description: `Buy ${trade.market.pair.speculativeToken.symbol} squared option`,
                  txEnvelope: () =>
                    lengineRouterContract.mint({
                      base: market.pair.baseToken.address,
                      speculative: market.pair.speculativeToken.address,
                      upperBound: market.pair.bound.asFraction
                        .multiply(scale)
                        .quotient.toString(),
                      amountS: trade.inputAmount.raw.toString(),
                      sharesMin: trade.outputAmount
                        .reduceBy(settings.maxSlippagePercent)
                        .raw.toString(),
                      recipient: address,
                      deadline:
                        Math.round(Date.now() / 1000) + settings.timeout * 60,
                    }),
                },
              ],
            },
          ])
        )
      : await beet(
          "Burn",
          approveStage.concat([
            {
              stageTitle: "Sell option",
              parallelTransactions: [
                {
                  title: "Sell option",
                  description: `Sell ${trade.market.pair.speculativeToken.symbol} squared option`,
                  txEnvelope: () =>
                    lengineRouterContract.burn({
                      base: market.pair.baseToken.address,
                      speculative: market.pair.speculativeToken.address,
                      upperBound: market.pair.bound.asFraction
                        .multiply(scale)
                        .quotient.toString(),
                      shares: trade.inputAmount.raw.toString(),
                      amountSMin: trade.outputAmount
                        .reduceBy(settings.maxSlippagePercent)
                        .quotient.toString(),
                      amountBMax: trade.baseAmount
                        .scale(
                          settings.maxSlippagePercent.add(Percent.ONE_HUNDRED)
                        )
                        .raw.toString(),
                      recipient: address,
                      deadline:
                        Math.round(Date.now() / 1000) + settings.timeout * 60,
                    }),
                },
              ],
            },
          ])
        );
  }, [
    address,
    approval,
    approve,
    baseApproval,
    baseApprove,
    beet,
    fromAmount,
    fromToken?.symbol,
    lengineRouterContract,
    market.pair.baseToken.address,
    market.pair.bound.asFraction,
    market.pair.speculativeToken.address,
    settings.maxSlippagePercent,
    settings.timeout,
    trade,
  ]);

  const swapDisabledReason = useMemo(
    () =>
      !fromToken
        ? "Select input token"
        : !toToken
        ? "Select output token"
        : !fromAmount || fromAmount.equalTo(0)
        ? "Enter an amount"
        : !userFromBalance ||
          approval === null ||
          baseApproval === null ||
          !marketInfo ||
          !trade
        ? "Loading"
        : fromAmount.greaterThan(userFromBalance)
        ? "Insufficient tokens"
        : null,
    [
      fromToken,
      toToken,
      fromAmount,
      userFromBalance,
      approval,
      baseApproval,
      marketInfo,
      trade,
    ]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};
