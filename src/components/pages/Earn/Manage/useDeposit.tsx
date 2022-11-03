import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { IMarket } from "../../../../contexts/environment";
import { LIQUIDITYMANAGER } from "../../../../contexts/environment";
import type { ISettings } from "../../../../contexts/settings";
import { useApproval, useApprove } from "../../../../hooks/useApproval";
import { useLiquidityManager } from "../../../../hooks/useContract";
import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import type { BeetStage, BeetTx } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import { scale } from "../../Trade/useTrade";

export const useDeposit = (
  market: IMarket,
  // tokenID: number | null,
  baseTokenAmount: TokenAmount | null,
  speculativeTokenAmount: TokenAmount | null,
  settings: ISettings
): { onSend: () => Promise<void>; disableReason: string | null } => {
  const liquidityManagerContract = useLiquidityManager(true);
  const Beet = useBeet();
  const { address } = useAccount();

  const balances = useTokenBalances(
    [market?.pair.baseToken ?? null, market?.pair.speculativeToken ?? null],
    address
  );

  const approvalS = useApproval(
    speculativeTokenAmount,
    address,
    LIQUIDITYMANAGER
  );
  const approvalB = useApproval(baseTokenAmount, address, LIQUIDITYMANAGER);
  const approveS = useApprove(speculativeTokenAmount, LIQUIDITYMANAGER);
  const approveB = useApprove(baseTokenAmount, LIQUIDITYMANAGER);

  const disableReason = useMemo(
    () =>
      !baseTokenAmount || !speculativeTokenAmount
        ? "Enter an amount"
        : baseTokenAmount.equalTo(0) && speculativeTokenAmount.equalTo(0)
        ? "Enter an amount"
        : !balances || approvalS === null || approvalB === null || !market
        ? "Loading..."
        : (balances[1] && speculativeTokenAmount.greaterThan(balances[1])) ||
          (balances[0] && baseTokenAmount.greaterThan(balances[0]))
        ? "Insufficient funds"
        : null,
    [
      baseTokenAmount,
      speculativeTokenAmount,
      balances,
      approvalS,
      approvalB,
      market,
    ]
  );

  const onSend = async () => {
    invariant(
      liquidityManagerContract && speculativeTokenAmount && baseTokenAmount
    );
    const approveStage: BeetStage[] =
      approvalS || approvalB
        ? [
            {
              stageTitle: "Approve tokens",
              parallelTransactions: [
                approvalS
                  ? {
                      title: "Approve CELO",
                      description: "Approve CELO",
                      txEnvelope: approveS,
                    }
                  : null,
                approvalB
                  ? {
                      title: "Approve cUSD",
                      description: "Approve cUSD",
                      txEnvelope: approveB,
                    }
                  : null,
              ].filter((t) => t !== null) as BeetTx[],
            },
          ]
        : [];

    invariant(address);

    await Beet(
      "Add liquidity to pool",
      approveStage.concat({
        stageTitle: "Add liquidity to pool",
        parallelTransactions: [
          {
            title: "Add liquidity to pool",
            description: "Add liquidity to pool",
            txEnvelope: () =>
              liquidityManagerContract.mint({
                base: market.pair.baseToken.address,
                speculative: market.pair.speculativeToken.address,
                baseScaleFactor: market.pair.baseScaleFactor,
                speculativeScaleFactor: market.pair.speculativeScaleFactor,
                upperBound: market.pair.bound.asFraction
                  .multiply(scale)
                  .quotient.toString(),
                amount0: baseTokenAmount.raw.toString(),
                amount1: speculativeTokenAmount.raw.toString(),
                liquidity: "100000000000000000",
                recipient: address,
                deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
              }),
          },
        ],
      })
    );
  };

  return {
    disableReason,
    onSend,
  };
};
