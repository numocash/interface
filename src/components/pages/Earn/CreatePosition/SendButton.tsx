import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { MINT_ROUTER } from "../../../../contexts/environment";
import { useApproval, useApprove } from "../../../../hooks/useApproval";
import { useMintRouterContract } from "../../../../hooks/useContract";
import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import type { BeetStage, BeetTx } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import { AsyncButton } from "../../../common/AsyncButton";
import { useCreatePair } from ".";

export const SendButton: React.FC = () => {
  const {
    speculativeToken,
    baseToken,
    bound,
    speculativeTokenAmount,
    baseTokenAmount,
  } = useCreatePair();

  const mintRouterContract = useMintRouterContract(true);

  const Beet = useBeet();

  const { address } = useAccount();

  const balances = useTokenBalances([speculativeToken, baseToken], address);

  const approvalS = useApproval(speculativeTokenAmount, address, MINT_ROUTER);
  const approvalB = useApproval(baseTokenAmount, address, MINT_ROUTER);
  const approveS = useApprove(speculativeTokenAmount, MINT_ROUTER);
  const approveB = useApprove(baseTokenAmount, MINT_ROUTER);

  //loading, insufficient balance
  const disableReason = useMemo(
    () =>
      !speculativeToken || !baseToken
        ? "Select a token"
        : !baseTokenAmount || !speculativeTokenAmount
        ? "Enter an amount"
        : baseTokenAmount?.equalTo(0) || speculativeTokenAmount?.equalTo(0)
        ? "Enter an amount"
        : !bound
        ? "Select an upper bound"
        : !balances || approvalS === null || approvalB === null
        ? "Loading..."
        : (balances[0] && speculativeTokenAmount.greaterThan(balances[0])) ||
          (balances[1] && baseTokenAmount.greaterThan(balances[1]))
        ? "Insufficient funds"
        : null,
    [
      balances,
      baseToken,
      baseTokenAmount,
      bound,
      speculativeToken,
      speculativeTokenAmount,
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
          mintRouterContract && speculativeTokenAmount && baseTokenAmount
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

        await Beet(
          "Add liquidity to pool",
          approveStage.concat({
            stageTitle: "Add liquidity to pool",
            parallelTransactions: [
              {
                title: "Add liquidity to pool",
                description: "Add liquidity to pool",
                txEnvelope: () =>
                  mintRouterContract.mintMaker(
                    speculativeTokenAmount.raw.toString(),
                    baseTokenAmount.raw.toString(),
                    speculativeTokenAmount.token.address,
                    baseTokenAmount.token.address,
                    "2500000000000000000"
                  ),
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
