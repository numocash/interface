import type { IMarket } from "@dahlia-labs/numoen-utils";
import { liquidityManagerInterface } from "@dahlia-labs/numoen-utils";
import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { ISettings } from "../../../../../contexts/settings";
import { useLiquidityManager } from "../../../../../hooks/useContract";
import { useUserLendgine } from "../../../../../hooks/useLendgine";
import { usePair } from "../../../../../hooks/usePair";
import { useGetIsWrappedNative } from "../../../../../hooks/useTokens";
import { useBeet } from "../../../../../utils/beet";
import { roundLiquidity } from "../../../../../utils/trade";

export const useWithdraw = (
  market: IMarket,
  tokenID: number | null,
  withdrawPercent: number,
  settings: ISettings
): { onSend: () => Promise<void>; disableReason: string | null } => {
  const liquidityManagerContract = useLiquidityManager(true);
  const Beet = useBeet();
  const navigate = useNavigate();
  const { address } = useAccount();
  const pairInfo = usePair(market.pair);
  const userLendgineInfo = useUserLendgine(tokenID, market);
  const isNative = useGetIsWrappedNative();

  const { userBaseAmount, userSpeculativeAmount, liquidity } = useMemo(() => {
    if (pairInfo && pairInfo.totalLPSupply.equalTo(0))
      return {
        userBaseAmount: new TokenAmount(market.pair.baseToken, 0),
        userSpeculativeAmount: new TokenAmount(market.pair.speculativeToken, 0),
      };

    const w = new Fraction(100 - withdrawPercent, 100);

    const userBaseAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.baseAmount
            .scale(userLendgineInfo.liquidity.divide(pairInfo.totalLPSupply))
            .scale(w)
        : null;
    const userSpeculativeAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.speculativeAmount
            .scale(userLendgineInfo.liquidity.divide(pairInfo.totalLPSupply))
            .scale(w)
        : null;

    const liquidity = userLendgineInfo
      ? roundLiquidity(userLendgineInfo.liquidity.scale(w))
      : null;
    return { userBaseAmount, userSpeculativeAmount, liquidity };
  }, [
    market.pair.baseToken,
    market.pair.speculativeToken,
    pairInfo,
    userLendgineInfo,
    withdrawPercent,
  ]);

  const disableReason = useMemo(
    () =>
      !tokenID
        ? "No deposits"
        : withdrawPercent === 0
        ? "Slide to amount"
        : !pairInfo ||
          !userLendgineInfo ||
          !userBaseAmount ||
          !userSpeculativeAmount
        ? "Loading..."
        : pairInfo.baseAmount.lessThan(userBaseAmount) ||
          pairInfo.speculativeAmount.lessThan(userSpeculativeAmount)
        ? "Insufficient liquidity"
        : null,
    [
      tokenID,
      withdrawPercent,
      pairInfo,
      userLendgineInfo,
      userBaseAmount,
      userSpeculativeAmount,
    ]
  );

  const onSend = async () => {
    invariant(
      liquidityManagerContract &&
        tokenID &&
        userBaseAmount &&
        userSpeculativeAmount &&
        userLendgineInfo &&
        liquidity
    );

    invariant(address);

    await Beet("Remove liquidity", [
      {
        stageTitle: "Remove liquidity",
        parallelTransactions: [
          {
            title: "Remove liquidity",
            description: "Remove liquidity",
            txEnvelope: () =>
              isNative(market.pair.speculativeToken) ||
              isNative(market.pair.baseToken)
                ? liquidityManagerContract.multicall([
                    liquidityManagerInterface.encodeFunctionData(
                      "decreaseLiquidity",
                      [
                        {
                          tokenID,
                          liquidity: liquidity.raw.toString(),
                          recipient: liquidityManagerContract.address,
                          amount0Min: userBaseAmount
                            .reduceBy(settings.maxSlippagePercent)
                            .raw.toString(),
                          amount1Min: userSpeculativeAmount
                            .reduceBy(settings.maxSlippagePercent)
                            .raw.toString(),
                          deadline:
                            Math.round(Date.now() / 1000) +
                            settings.timeout * 60,
                        },
                      ]
                    ),
                    liquidityManagerInterface.encodeFunctionData(
                      "unwrapWETH9",
                      [0, address]
                    ),
                    liquidityManagerInterface.encodeFunctionData("sweepToken", [
                      !isNative(market.pair.baseToken)
                        ? market.pair.baseToken.address
                        : market.pair.speculativeToken.address,
                      0,
                      address,
                    ]),
                  ])
                : liquidityManagerContract.decreaseLiquidity({
                    tokenID,
                    liquidity: liquidity.raw.toString(),
                    recipient: address,
                    amount0Min: userBaseAmount
                      .reduceBy(settings.maxSlippagePercent)
                      .raw.toString(),
                    amount1Min: userSpeculativeAmount
                      .reduceBy(settings.maxSlippagePercent)
                      .raw.toString(),
                    deadline:
                      Math.round(Date.now() / 1000) + settings.timeout * 60,
                  }),
          },
        ],
      },
    ]);

    if (withdrawPercent === 100) {
      navigate("/earn");
    }
  };
  return { onSend, disableReason };
};
