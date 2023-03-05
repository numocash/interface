import { BigNumber } from "@ethersproject/bignumber";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../../../constants/types";
import { useEnvironment } from "../../../../contexts/environment2";
import {
  useLiquidityManagerCollect,
  usePrepareLiquidityManagerCollect,
} from "../../../../generated";
import {
  accruedLendgineInfo,
  accruedLendginePositionInfo,
  getT,
} from "../../../../utils/Numoen/lendgineMath";

export const useCollect = ({
  lendgine,
  lendgineInfo,
  position,
}: {
  lendgine: Lendgine;
  lendgineInfo: LendgineInfo<Lendgine>;
  position: LendginePosition<Lendgine>;
}) => {
  const environment = useEnvironment();
  const { address } = useAccount();
  const t = getT();

  const { args } = useMemo(() => {
    if (!address) return {};
    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    const updatedPosition = accruedLendginePositionInfo(updatedInfo, position);

    const args = [
      {
        lendgine: lendgine.address,
        recipient: address,
        amountRequested: BigNumber.from(
          updatedPosition.tokensOwed.quotient.toString()
        ),
      },
    ] as const;

    return { args };
  }, [address, lendgine, lendgineInfo, position, t]);

  const prepareCollect = usePrepareLiquidityManagerCollect({
    enabled: !!args,
    address: environment.base.liquidityManager,
    args: args,
    staleTime: Infinity,
  });

  const sendCollect = useLiquidityManagerCollect(prepareCollect.config);

  return useMemo(
    () =>
      [
        {
          stageTitle: "Collect interest",
          parallelTransactions: [
            {
              title: `Collect interest`,
              tx: {
                prepare: prepareCollect as ReturnType<
                  typeof usePrepareContractWrite
                >,
                send: sendCollect,
              },
            },
          ],
        },
      ] as const,
    [prepareCollect, sendCollect]
  );
};
