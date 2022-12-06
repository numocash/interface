import type { IMarket, LendgineRouter } from "@dahlia-labs/numoen-utils";
import {
  LENDGINEROUTER,
  lendgineRouterInterface,
} from "@dahlia-labs/numoen-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useSettings } from "../../../contexts/settings";
import { useApproval, useApprove } from "../../../hooks/useApproval";
import { useChain } from "../../../hooks/useChain";
import { useLendgineRouter } from "../../../hooks/useContract";
import { useLendgine, useRefPrice } from "../../../hooks/useLendgine";
import { usePair } from "../../../hooks/usePair";
import { useGetIsWrappedNative } from "../../../hooks/useTokens";
import { useUniswapPair } from "../../../hooks/useUniswapPair";
import type { BeetStage, BeetTx } from "../../../utils/beet";
import { useBeet } from "../../../utils/beet";
import { add1, checkInvariant } from "../../../utils/Numoen/invariantMath";
import {
  convertShareToLiquidity,
  liquidityToSpeculative,
  speculativeToLiquidity,
} from "../../../utils/Numoen/lendgineMath";
import {
  determineBorrowAmount,
  determineRepayAmount,
  determineSlippage,
} from "../../../utils/Numoen/trade";

export const scale = new Fraction(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
);

export const useMint = (
  input: TokenAmount,
  market: IMarket
): {
  outputAmount: TokenAmount;
  disableReason: string | null;
  callback: () => Promise<void>;
} | null => {
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);
  const uniswapInfo = useUniswapPair(market);
  const price = useRefPrice(market);
  const settings = useSettings();
  const beet = useBeet();

  const { address } = useAccount();
  const chain = useChain();

  const isNative = useGetIsWrappedNative();

  const approval = useApproval(input, address, LENDGINEROUTER[chain]);
  const approve = useApprove(input, LENDGINEROUTER[chain]);
  const lengineRouterContract = useLendgineRouter(true);

  const ret = useMemo(() => {
    if (!price || !marketInfo || !pairInfo || !uniswapInfo) return null;
    const borrowAmount = determineBorrowAmount(
      input,
      market,
      price,
      settings.maxSlippagePercent
    );

    const lpAmount = speculativeToLiquidity(input.add(borrowAmount), market);

    // how much base tokens you will withdraw
    const baseAmount = pairInfo.totalLPSupply.equalTo(0)
      ? new TokenAmount(market.pair.baseToken, 0)
      : pairInfo.baseAmount.scale(lpAmount.divide(pairInfo.totalLPSupply));
    const priceImpact = determineSlippage(
      baseAmount, // input amount should be in base tokens
      uniswapInfo[0],
      uniswapInfo[1]
    );
    const shares = marketInfo.totalLiquidityBorrowed.equalTo(0)
      ? new TokenAmount(market.token, lpAmount.raw)
      : new TokenAmount(
          market.token,
          lpAmount.scale(
            marketInfo.totalSupply.divide(marketInfo.totalLiquidityBorrowed)
          ).raw
        );

    const disableReason =
      approval === null
        ? "Loading"
        : lpAmount.greaterThan(pairInfo.totalLPSupply)
        ? "Insufficient liquidity"
        : priceImpact.greaterThan(settings.maxSlippagePercent)
        ? "Slippage too large"
        : null;

    console.log(
      "Invariant check:",
      pairInfo.totalLPSupply.greaterThan(0) &&
        checkInvariant(
          pairInfo.baseAmount.subtract(
            new TokenAmount(
              market.pair.baseToken,
              JSBI.divide(
                JSBI.multiply(pairInfo.baseAmount.raw, lpAmount.raw),
                pairInfo.totalLPSupply.raw
              )
            )
          ),
          pairInfo.speculativeAmount.subtract(
            new TokenAmount(
              market.pair.speculativeToken,
              JSBI.divide(
                JSBI.multiply(pairInfo.speculativeAmount.raw, lpAmount.raw),
                pairInfo.totalLPSupply.raw
              )
            )
          ),
          new TokenAmount(
            market.pair.lp,
            JSBI.subtract(pairInfo.totalLPSupply.raw, lpAmount.raw)
          ),
          market
        )
    );

    const approveStage: BeetStage[] = approval
      ? [
          {
            stageTitle: "Approve tokens",
            parallelTransactions: [
              approval
                ? {
                    title: "Approve",
                    description: `Approve ${input.toFixed(2, {
                      groupSeparator: ",",
                    })} ${input.token.symbol}`,
                    txEnvelope: approve,
                  }
                : null,
            ].filter((t) => t !== null) as BeetTx[],
          },
        ]
      : [];

    // TODO: add types
    const mintParams: Omit<LendgineRouter.MintParamsStruct, "recipient"> = {
      base: market.pair.baseToken.address,
      speculative: market.pair.speculativeToken.address,
      baseScaleFactor: market.pair.baseScaleFactor,
      speculativeScaleFactor: market.pair.speculativeScaleFactor,
      upperBound: market.pair.bound.asFraction
        .multiply(scale)
        .quotient.toString(),
      liquidity: speculativeToLiquidity(input, market).raw.toString(),
      borrowAmount: borrowAmount.raw.toString(),
      sharesMin: shares.reduceBy(settings.maxSlippagePercent).raw.toString(),
      deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
    };

    const callback = async () => {
      invariant(lengineRouterContract && address);

      await beet(
        "Buy option",
        approveStage.concat([
          {
            stageTitle: "Buy option",
            parallelTransactions: [
              {
                title: "Buy option",
                description: `Buy ${market.pair.speculativeToken.symbol} squared option`,
                txEnvelope: () =>
                  isNative(input.token)
                    ? lengineRouterContract.multicall(
                        [
                          lendgineRouterInterface.encodeFunctionData("mint", [
                            { ...mintParams, recipient: address },
                          ]),
                          lendgineRouterInterface.encodeFunctionData(
                            "refundETH"
                          ),
                        ],
                        {
                          value: isNative(input.token)
                            ? input.raw.toString()
                            : 0,
                        }
                      )
                    : lengineRouterContract.mint({
                        ...mintParams,
                        recipient: address,
                      }),
              },
            ],
          },
        ])
      );
    };

    return { outputAmount: shares, disableReason, callback };
  }, [
    address,
    approval,
    approve,
    beet,
    input,
    isNative,
    lengineRouterContract,
    market,
    marketInfo,
    pairInfo,
    price,
    settings.maxSlippagePercent,
    settings.timeout,
    uniswapInfo,
  ]);

  return ret
    ? {
        outputAmount: ret.outputAmount,
        disableReason: ret.disableReason,
        callback: ret.callback,
      }
    : null;
};

export const useBurn = (
  input: TokenAmount,
  market: IMarket
): {
  outputAmount: TokenAmount;
  disableReason: string | null;
  callback: () => Promise<void>;
} | null => {
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);
  const uniswapInfo = useUniswapPair(market);
  const settings = useSettings();
  const beet = useBeet();

  const { address } = useAccount();
  const chain = useChain();

  const isNative = useGetIsWrappedNative();

  const approval = useApproval(input, address, LENDGINEROUTER[chain]);
  const approve = useApprove(input, LENDGINEROUTER[chain]);
  const lengineRouterContract = useLendgineRouter(true);

  const ret = useMemo(() => {
    if (!marketInfo || !pairInfo || !uniswapInfo) return null;

    const liquidity = convertShareToLiquidity(input, market, marketInfo);
    const speculativeAmountOut = liquidityToSpeculative(liquidity, market);
    const baseAmount = pairInfo.totalLPSupply.greaterThan(0)
      ? add1(
          new TokenAmount(
            market.pair.baseToken,
            JSBI.divide(
              JSBI.multiply(pairInfo.baseAmount.raw, liquidity.raw),
              pairInfo.totalLPSupply.raw
            )
          )
        )
      : new TokenAmount(market.pair.baseToken, 0);

    const speculativeAmount = pairInfo.totalLPSupply.greaterThan(0)
      ? add1(
          new TokenAmount(
            market.pair.speculativeToken,
            JSBI.divide(
              JSBI.multiply(pairInfo.speculativeAmount.raw, liquidity.raw),
              pairInfo.totalLPSupply.raw
            )
          )
        )
      : new TokenAmount(market.pair.speculativeToken, 0);

    // speculative tokens
    const repayAmount = determineRepayAmount(
      baseAmount.raw,
      speculativeAmount.raw,
      uniswapInfo[0].raw,
      uniswapInfo[1].raw
    );

    const output = new TokenAmount(
      market.pair.speculativeToken,
      JSBI.subtract(speculativeAmountOut.raw, repayAmount)
    );

    const burnParams: Omit<LendgineRouter.BurnParamsStruct, "recipient"> = {
      base: market.pair.baseToken.address,
      speculative: market.pair.speculativeToken.address,
      baseScaleFactor: market.pair.baseScaleFactor,
      speculativeScaleFactor: market.pair.speculativeScaleFactor,
      shares: input.raw.toString(),
      amount0Min: 0,
      amount1Min: 0, // TODO
      upperBound: market.pair.bound.asFraction
        .multiply(scale)
        .quotient.toString(),
      deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
    };

    console.log(
      "Invariant check burn:",
      checkInvariant(
        pairInfo.baseAmount.add(baseAmount),
        pairInfo.speculativeAmount.add(speculativeAmount),
        pairInfo.totalLPSupply.add(liquidity),
        market
      )
    );

    const approveStage: BeetStage[] = approval
      ? [
          {
            stageTitle: "Approve tokens",
            parallelTransactions: [
              approval
                ? {
                    title: "Approve",
                    description: `Approve ${input.toFixed(2, {
                      groupSeparator: ",",
                    })} ${input.token.symbol}`,
                    txEnvelope: approve,
                  }
                : null,
            ].filter((t) => t !== null) as BeetTx[],
          },
        ]
      : [];

    const callback = async () => {
      invariant(lengineRouterContract && address);

      await beet(
        "Burn",
        approveStage.concat([
          {
            stageTitle: "Sell option",
            parallelTransactions: [
              {
                title: "Sell option",
                description: `Sell ${market.pair.speculativeToken.symbol} squared option`,
                txEnvelope: () =>
                  isNative(market.pair.speculativeToken)
                    ? lengineRouterContract.multicall([
                        lendgineRouterInterface.encodeFunctionData("burn", [
                          {
                            ...burnParams,
                            recipient: lengineRouterContract.address,
                          },
                        ]),
                        lendgineRouterInterface.encodeFunctionData(
                          "unwrapWETH9",
                          [0, address] // TODO: fix this
                        ),
                      ])
                    : lengineRouterContract.burn({
                        ...burnParams,
                        recipient: address,
                      }),
              },
            ],
          },
        ])
      );
    };
    return { output, baseAmount, speculativeAmount, callback };
  }, [
    address,
    approval,
    approve,
    beet,
    input,
    isNative,
    lengineRouterContract,
    market,
    marketInfo,
    pairInfo,
    settings.timeout,
    uniswapInfo,
  ]);

  const disableReason = useMemo(
    () => (approval === null ? "Loading" : null),
    [approval]
  );

  return ret
    ? { outputAmount: ret.output, disableReason, callback: ret.callback }
    : null;
};
