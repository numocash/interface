import type { IMarket } from "@dahlia-labs/numoen-utils";
import { liquidityManagerInterface } from "@dahlia-labs/numoen-utils";
import { Fraction, Percent, TokenAmount } from "@dahlia-labs/token-utils";
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const w = new Percent(withdrawPercent, 100);

  const { userBaseAmount, userSpeculativeAmount } = useMemo(() => {
    if (pairInfo && pairInfo.totalLPSupply.equalTo(0))
      return {
        userBaseAmount: new TokenAmount(market.pair.baseToken, 0),
        userSpeculativeAmount: new TokenAmount(market.pair.speculativeToken, 0),
      };
    const userBaseAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.baseAmount.scale(
            userLendgineInfo.liquidity.divide(pairInfo.totalLPSupply)
          )
        : null;
    const userSpeculativeAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.speculativeAmount.scale(
            userLendgineInfo.liquidity.divide(pairInfo.totalLPSupply)
          )
        : null;
    return { userBaseAmount, userSpeculativeAmount };
  }, [
    market.pair.baseToken,
    market.pair.speculativeToken,
    pairInfo,
    userLendgineInfo,
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
        : pairInfo.baseAmount.lessThan(userBaseAmount.scale(w)) ||
          pairInfo.speculativeAmount.lessThan(userSpeculativeAmount.scale(w))
        ? "Insufficient liquidity"
        : null,
    [
      tokenID,
      withdrawPercent,
      pairInfo,
      userLendgineInfo,
      userBaseAmount,
      userSpeculativeAmount,
      w,
    ]
  );

  const onSend = async () => {
    invariant(
      liquidityManagerContract &&
        tokenID &&
        userBaseAmount &&
        userSpeculativeAmount &&
        userLendgineInfo
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
                          liquidity: userLendgineInfo.liquidity
                            .scale(new Fraction(withdrawPercent, 100))
                            .raw.toString(),
                          recipient: liquidityManagerContract.address,
                          amount0Min: userBaseAmount
                            .scale(w)
                            .reduceBy(settings.maxSlippagePercent)
                            .raw.toString(),
                          amount1Min: userSpeculativeAmount
                            .scale(w)
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
                    liquidity: userLendgineInfo.liquidity
                      .scale(new Fraction(withdrawPercent, 100))
                      .raw.toString(),
                    recipient: address,
                    amount0Min: userBaseAmount
                      .scale(w)
                      .reduceBy(settings.maxSlippagePercent)
                      .raw.toString(),
                    amount1Min: userSpeculativeAmount
                      .scale(w)
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
