import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { IMarket } from "../../../../contexts/environment";
import type { ISettings } from "../../../../contexts/settings";
import { useLiquidityManager } from "../../../../hooks/useContract";
import { useUserLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { useBeet } from "../../../../utils/beet";

export const useWithdraw = (
  market: IMarket,
  tokenID: number | null,
  withdrawPercent: number,
  settings: ISettings
): { onSend: () => Promise<void>; disableReason: string | null } => {
  const liquidityManagerContract = useLiquidityManager(true);
  const Beet = useBeet();
  const { address } = useAccount();
  const pairInfo = usePair(market.pair);
  const userLendgineInfo = useUserLendgine(tokenID, market);

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
        userLendgineInfo
    );

    invariant(address);
    // TODO: check amounts

    await Beet("Remove liquidity", [
      {
        stageTitle: "Remove liquidity",
        parallelTransactions: [
          {
            title: "Remove liquidity",
            description: "Remove liquidity",
            txEnvelope: () =>
              liquidityManagerContract.decreaseLiquidity({
                tokenID,
                amount0: userBaseAmount
                  .scale(new Fraction(withdrawPercent, 100))
                  .raw.toString(),
                amount1: userSpeculativeAmount
                  .scale(new Fraction(withdrawPercent, 100))
                  .raw.toString(),
                liquidity: userLendgineInfo.liquidity
                  .scale(new Fraction(withdrawPercent, 100))
                  .raw.toString(),
                recipient: address,
                deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
              }),
          },
        ],
      },
    ]);

    // !tokenID && navigate(`/earn/`);
    // TODO: if withdrawing all
  };
  return { onSend, disableReason };
};
