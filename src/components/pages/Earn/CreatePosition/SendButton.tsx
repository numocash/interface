import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { LIQUIDITYMANAGER } from "../../../../contexts/environment";
import { useSettings } from "../../../../contexts/settings";
import { useApproval, useApprove } from "../../../../hooks/useApproval";
import { useLiquidityManager } from "../../../../hooks/useContract";
import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import type { BeetStage, BeetTx } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import { AsyncButton } from "../../../common/AsyncButton";
import { scale } from "../../Trade/useTrade";
import { useCreatePair } from ".";

export const SendButton: React.FC = () => {
  const { market, tick, speculativeTokenAmount, baseTokenAmount } =
    useCreatePair();
  const settings = useSettings();

  const liquidityManagerContract = useLiquidityManager(true);

  const Beet = useBeet();

  const { address } = useAccount();

  const balances = useTokenBalances(
    [market.pair.baseToken, market.pair.speculativeToken],
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

  //loading, insufficient balance
  const disableReason = useMemo(
    () =>
      !baseTokenAmount || !speculativeTokenAmount
        ? "Enter an amount"
        : baseTokenAmount?.equalTo(0) && speculativeTokenAmount?.equalTo(0)
        ? "Enter an amount"
        : tick === 0
        ? "Invalid Tick"
        : !balances || approvalS === null || approvalB === null
        ? "Loading..."
        : (balances[1] && speculativeTokenAmount.greaterThan(balances[1])) ||
          (balances[0] && baseTokenAmount.greaterThan(balances[0]))
        ? "Insufficient funds"
        : null,
    [
      baseTokenAmount,
      speculativeTokenAmount,
      tick,
      balances,
      approvalS,
      approvalB,
    ]
  );
  return (
    <AsyncButton
      variant="primary"
      disabled={!!disableReason}
      tw="justify-center items-center w-full h-12 text-xl "
      onClick={async () => {
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
                    upperBound: market.pair.bound.asFraction
                      .multiply(scale)
                      .quotient.toString(),
                    tick: tick,
                    amount0: baseTokenAmount.raw.toString(),
                    amount1: speculativeTokenAmount.raw.toString(),
                    liquidityMin: 0,
                    recipient: address,
                    deadline:
                      Math.round(Date.now() / 1000) + settings.timeout * 60,
                  }),
              },
            ],
          })
        );
      }}
    >
      {disableReason ?? "Add liquidity"}
    </AsyncButton>
  );
};
