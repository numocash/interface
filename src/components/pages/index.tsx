import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useTokenContract } from "../../hooks/useContract";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { useCelo } from "../../hooks/useTokens";
import { useBeet } from "../../utils/beet";
import { AsyncButton } from "../common/AsyncButton";
import { Module } from "../common/Module";

export const View: React.FC = () => {
  const celo = useCelo();
  const { address } = useAccount();
  const celoBalance = useTokenBalance(celo, address);

  const Beet = useBeet();

  const celoContract = useTokenContract(celo, true);

  const disableReason = !celoBalance
    ? "Loading"
    : celoBalance.lessThan(1)
    ? "Insufficient Celo"
    : null;

  return (
    <Module>
      Your Celo Balance: {celoBalance?.toFixed(2, { groupSeparator: "," })}
      <AsyncButton
        size="md"
        variant="primary"
        tw="flex-1"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(celoContract);

          await Beet("Transfer to Kyle", [
            {
              stageTitle: "Transfer to Kyle",
              parallelTransactions: [
                {
                  title: "Transfer to Kyle",
                  description: "Transfer 1 CELO to Kyle",
                  txEnvelope: async () =>
                    celoContract.transfer(
                      "0x59A6AbC89C158ef88d5872CaB4aC3B08474883D9",
                      "1000000000000000000"
                    ),
                },
              ],
            },
          ]);
        }}
      >
        {disableReason ?? "Send 1 Celo to Kyle"}
      </AsyncButton>
    </Module>
  );
};
