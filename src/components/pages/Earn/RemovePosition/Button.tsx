import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useSettings } from "../../../../contexts/settings";
import { useLiquidityManager } from "../../../../hooks/useContract";
import { useBeet } from "../../../../utils/beet";
import { AsyncButton } from "../../../common/AsyncButton";
import { useRemovePosition } from ".";

export const ConfirmButton: React.FC = () => {
  const { removePercent, market, userInfo } = useRemovePosition();

  const settings = useSettings();
  const { address } = useAccount();

  const liquidityManagerContract = useLiquidityManager(true);

  const Beet = useBeet();

  const disableReason = useMemo(
    () =>
      removePercent === 0
        ? "Slide to amount"
        : !userInfo || !market
        ? "Loading..."
        : null,
    [removePercent, userInfo, market]
  );

  return (
    <AsyncButton
      variant="primary"
      disabled={!!disableReason}
      tw="justify-center items-center w-full h-12 text-xl "
      onClick={async () => {
        invariant(liquidityManagerContract && market && userInfo && address);

        await Beet("Remove liquidity", [
          {
            stageTitle: "Remove liquidity",
            parallelTransactions: [
              {
                title: "Remove liquidity",
                description: "Remove liquidity",
                txEnvelope: () =>
                  liquidityManagerContract.decreaseLiquidity({
                    tokenID: userInfo.tokenID,
                    amount0: userInfo.liquidity
                      .multiply(removePercent)
                      .divide(100)
                      .quotient.toString(),
                    amount1: 0,
                    liquidityMax: userInfo.liquidity.raw.toString(),
                    recipient: address,
                    deadline:
                      Math.round(Date.now() / 1000) + settings.timeout * 60,
                  }),
              },
            ],
          },
        ]);
      }}
    >
      {disableReason ?? "Remove"}
    </AsyncButton>
  );
};
