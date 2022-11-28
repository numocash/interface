import { LENDGINEROUTER } from "@dahlia-labs/numoen-utils";
import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction, Percent } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useAddressToMarket } from "../../../contexts/environment";
import { useSettings } from "../../../contexts/settings";
import { useApproval, useApprove } from "../../../hooks/useApproval";
import { useChain } from "../../../hooks/useChain";
import { useLendgineRouter } from "../../../hooks/useContract";
import { useLendgine, useRefPrice } from "../../../hooks/useLendgine";
import { usePair } from "../../../hooks/usePair";
import { useWrappedTokenBalance } from "../../../hooks/useTokenBalance";
import { useGetIsWrappedNative } from "../../../hooks/useTokens";
import { useUniswapPair } from "../../../hooks/useUniswapPair";
import type { BeetStage, BeetTx } from "../../../utils/beet";
import { useBeet } from "../../../utils/beet";
import {
  convertShareToLiquidity,
  determineBorrowAmount,
  determineSlippage,
  outputAmount,
  roundLiquidity,
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
  const chain = useChain();
  const isNative = useGetIsWrappedNative();

  const lengineRouterContract = useLendgineRouter(true);

  const userFromBalance = useWrappedTokenBalance(fromToken ?? null);

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
        ? determineBorrowAmount(
            fromAmount,
            market,
            price,
            settings.maxSlippagePercent
          )
        : null,
    [fromAmount, price, market, settings]
  );

  const priceImpact = useMemo(() => {
    if (pairInfo && pairInfo.totalLPSupply.equalTo(0)) return new Percent(0);
    const liquidity =
      fromAmount && borrowAmount
        ? speculativeToLiquidity(fromAmount.add(borrowAmount), market)
        : null;
    const baseAmount =
      pairInfo && liquidity
        ? pairInfo.baseAmount.scale(liquidity.divide(pairInfo.totalLPSupply))
        : null;
    return fromAmount && baseAmount && uniswapInfo
      ? determineSlippage(
          baseAmount, // input amount should be in base tokens
          uniswapInfo[0],
          uniswapInfo[1]
        )
      : null;
  }, [borrowAmount, fromAmount, market, pairInfo, uniswapInfo]);

  const approval = useApproval(fromAmount, address, LENDGINEROUTER[chain]);
  const approve = useApprove(fromAmount, LENDGINEROUTER[chain]);

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
              uniswapInfo,
              settings
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
      settings,
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
                    lengineRouterContract.mint(
                      {
                        base: market.pair.baseToken.address,
                        speculative: market.pair.speculativeToken.address,
                        baseScaleFactor: market.pair.baseScaleFactor,
                        speculativeScaleFactor:
                          market.pair.speculativeScaleFactor,
                        upperBound: market.pair.bound.asFraction
                          .multiply(scale)
                          .quotient.toString(),
                        liquidity: roundLiquidity(
                          speculativeToLiquidity(trade.inputAmount, market)
                        ).raw.toString(),
                        borrowAmount: borrowAmount.raw.toString(),
                        sharesMin: trade.outputAmount
                          .reduceBy(settings.maxSlippagePercent)
                          .raw.toString(),
                        recipient: address,
                        deadline:
                          Math.round(Date.now() / 1000) + settings.timeout * 60,
                      },
                      {
                        value: isNative(trade.inputAmount.token)
                          ? trade.inputAmount.raw.toString()
                          : 0,
                      }
                    ),
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
                    isNative(market.pair.speculativeToken)
                      ? lengineRouterContract.multicall([
                          lengineRouterContract.interface.encodeFunctionData(
                            "burn",
                            [
                              {
                                base: market.pair.baseToken.address,
                                speculative:
                                  market.pair.speculativeToken.address,
                                baseScaleFactor: market.pair.baseScaleFactor,
                                speculativeScaleFactor:
                                  market.pair.speculativeScaleFactor,
                                liquidity: roundLiquidity(
                                  convertShareToLiquidity(
                                    trade.inputAmount,
                                    market,
                                    marketInfo
                                  )
                                )
                                  .reduceBy(settings.maxSlippagePercent)
                                  .raw.toString(),
                                sharesMax: trade.inputAmount.raw.toString(),
                                upperBound: market.pair.bound.asFraction
                                  .multiply(scale)
                                  .quotient.toString(),
                                recipient: lengineRouterContract.address,
                                deadline:
                                  Math.round(Date.now() / 1000) +
                                  settings.timeout * 60,
                              },
                            ]
                          ),
                          lengineRouterContract.interface.encodeFunctionData(
                            "unwrapWETH9",
                            [0, address] // TODO: fix this
                          ),
                        ])
                      : lengineRouterContract.burn({
                          base: market.pair.baseToken.address,
                          speculative: market.pair.speculativeToken.address,
                          baseScaleFactor: market.pair.baseScaleFactor,
                          speculativeScaleFactor:
                            market.pair.speculativeScaleFactor,
                          liquidity: roundLiquidity(
                            convertShareToLiquidity(
                              trade.inputAmount,
                              market,
                              marketInfo
                            )
                          )
                            .reduceBy(settings.maxSlippagePercent)
                            .raw.toString(),
                          sharesMax: trade.inputAmount.raw.toString(),
                          upperBound: market.pair.bound.asFraction
                            .multiply(scale)
                            .quotient.toString(),
                          recipient: address,
                          deadline:
                            Math.round(Date.now() / 1000) +
                            settings.timeout * 60,
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
    isNative,
    lengineRouterContract,
    market,
    marketInfo,
    price,
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
          !borrowAmount ||
          !marketInfo ||
          !pairInfo ||
          !trade ||
          !price ||
          !priceImpact
        ? "Loading"
        : trade.mint &&
          speculativeToLiquidity(
            trade.inputAmount.add(borrowAmount),
            market
          ).greaterThan(pairInfo?.totalLPSupply)
        ? "Insufficient liquidity"
        : trade.mint && priceImpact.greaterThan(settings.maxSlippagePercent)
        ? "Slippage too large"
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
      pairInfo,
      trade,
      price,
      priceImpact,
      market,
      settings.maxSlippagePercent,
    ]
  );

  return {
    handleTrade,
    swapDisabledReason,
    trade,
  };
};
