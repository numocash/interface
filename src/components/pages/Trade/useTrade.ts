import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction, Percent } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import {
  LENDGINEROUTER,
  useAddressToMarket,
} from "../../../contexts/environment";
import { useSettings } from "../../../contexts/settings";
import { useApproval, useApprove } from "../../../hooks/useApproval";
import { useLendgineRouter } from "../../../hooks/useContract";
import { useLendgine, useRefPrice } from "../../../hooks/useLendgine";
import { usePair } from "../../../hooks/usePair";
import { useTokenBalance } from "../../../hooks/useTokenBalance";
import { useUniswapPair } from "../../../hooks/useUniswapPair";
import type { BeetStage, BeetTx } from "../../../utils/beet";
import { useBeet } from "../../../utils/beet";
import {
  convertShareToLiquidity,
  determineBorrowAmount,
  outputAmount,
  speculativeToLiquidity,
} from "../../../utils/trade";
import type { Trade } from "./useSwapState";

export interface UseTradeParams {
  fromAmount?: TokenAmount;
  fromToken?: Token;
  toToken?: Token;
}
export const scale = new Fraction(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
);

export type ITradeCallback = () => Promise<void> | void;

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

  const market0 = useAddressToMarket(fromToken?.address);
  const market1 = useAddressToMarket(toToken?.address);

  const mint = !market0;
  const market = market0 ?? market1;
  invariant(market);
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);
  const uniswapInfo = useUniswapPair(market);
  const price = useRefPrice(market);
  const borrowAmount = useMemo(
    () =>
      fromAmount && price
        ? determineBorrowAmount(fromAmount, market, price, 100)
        : null,
    [fromAmount, price, market]
  );
  const approval = useApproval(fromAmount, address, LENDGINEROUTER);
  const approve = useApprove(fromAmount, LENDGINEROUTER);

  const trade = useMemo(
    () =>
      fromAmount &&
      toToken &&
      fromToken &&
      market &&
      marketInfo &&
      price &&
      uniswapInfo &&
      pairInfo
        ? {
            market,
            mint,
            inputAmount: fromAmount,
            outputAmount: outputAmount(
              market,
              marketInfo,
              pairInfo,
              fromAmount,
              price,
              uniswapInfo
            ),
          }
        : null,
    [
      fromAmount,
      fromToken,
      market,
      marketInfo,
      mint,
      pairInfo,
      price,
      toToken,
      uniswapInfo,
    ]
  );

  const handleTrade = useCallback(async () => {
    invariant(
      lengineRouterContract &&
        address &&
        trade &&
        price &&
        borrowAmount &&
        fromAmount &&
        marketInfo
    );

    const approveStage: BeetStage[] = approval
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
                      baseScaleFactor: market.pair.baseScaleFactor,
                      speculativeScaleFactor:
                        market.pair.speculativeScaleFactor,
                      upperBound: market.pair.bound.asFraction
                        .multiply(scale)
                        .quotient.toString(),
                      liquidity: speculativeToLiquidity(
                        trade.inputAmount,
                        market
                      ).raw.toString(),
                      borrowAmount: borrowAmount.raw.toString(),
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
                      baseScaleFactor: market.pair.baseScaleFactor,
                      speculativeScaleFactor:
                        market.pair.speculativeScaleFactor,
                      liquidityMax: convertShareToLiquidity(
                        trade.inputAmount,
                        market,
                        marketInfo
                      )
                        .scale(
                          Percent.ONE_HUNDRED.add(settings.maxSlippagePercent)
                        )
                        .raw.toString(),
                      shares: trade.inputAmount.raw.toString(),
                      upperBound: market.pair.bound.asFraction
                        .multiply(scale)
                        .quotient.toString(),
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
    beet,
    borrowAmount,
    fromAmount,
    fromToken?.symbol,
    lengineRouterContract,
    market,
    marketInfo,
    price,
    settings.maxSlippagePercent,
    settings.timeout,
    trade,
  ]);

  // TODO: estimate slippage on uniswap to determine borrow amount
  // TODO: show price impact

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
          !borrowAmount ||
          !marketInfo ||
          !trade ||
          !price
        ? "Loading"
        : trade.mint &&
          speculativeToLiquidity(trade.inputAmount, market).greaterThan(
            marketInfo.totalLiquidity.subtract(
              marketInfo.totalLiquidityBorrowed
            )
          )
        ? "Insufficient liquidity"
        : fromAmount.greaterThan(userFromBalance)
        ? "Insufficient tokens"
        : null,
    [
      fromToken,
      toToken,
      fromAmount,
      userFromBalance,
      approval,
      borrowAmount,
      marketInfo,
      trade,
      price,
      market,
    ]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};
