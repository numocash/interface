import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
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
  useLiquidityManager,
  useLiquidityManagerCollect,
  useLiquidityManagerMulticall,
  usePrepareLiquidityManagerCollect,
  usePrepareLiquidityManagerMulticall,
} from "../../../../generated";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
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

  const liquidityManagerContract = useLiquidityManager({
    address: environment.base.liquidityManager,
  });
  const native = useIsWrappedNative(lendgine.token1);

  const { args, unwrapArgs } = useMemo(() => {
    if (!address) return {};
    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    const updatedPosition = accruedLendginePositionInfo(updatedInfo, position);

    const args = [
      {
        lendgine: lendgine.address,
        recipient: native ? AddressZero : address,
        amountRequested: BigNumber.from(
          updatedPosition.tokensOwed.quotient.toString()
        ),
      },
    ] as const;

    const unwrapArgs = [BigNumber.from(0), address] as const; // safe to be zero because the collect estimation will fail

    return { args, native, unwrapArgs };
  }, [address, lendgine, lendgineInfo, native, position, t]);

  const prepareCollect = usePrepareLiquidityManagerCollect({
    enabled: !!args,
    address: environment.base.liquidityManager,
    args: args,
    staleTime: Infinity,
  });
  const sendCollect = useLiquidityManagerCollect(prepareCollect.config);

  const prepareMulticall = usePrepareLiquidityManagerMulticall({
    enabled:
      !!native &&
      !!unwrapArgs &&
      !!prepareCollect.config.request &&
      !!liquidityManagerContract,
    address: environment.base.liquidityManager,
    staleTime: Infinity,
    args:
      prepareCollect.config.request &&
      prepareCollect.config.request.data &&
      liquidityManagerContract
        ? [
            [
              prepareCollect.config.request.data,
              liquidityManagerContract.interface.encodeFunctionData(
                "unwrapWETH",
                unwrapArgs
              ),
            ] as `0x${string}`[],
          ]
        : undefined,
  });
  const sendMulticall = useLiquidityManagerMulticall(prepareMulticall.config);

  return useMemo(
    () =>
      native
        ? [
            {
              stageTitle: "Collect interest",
              parallelTransactions: [
                {
                  title: `Collect interest`,
                  tx: {
                    prepare: prepareMulticall as ReturnType<
                      typeof usePrepareContractWrite
                    >,
                    send: sendMulticall,
                  },
                },
              ],
            },
          ]
        : ([
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
          ] as const),
    [native, prepareCollect, prepareMulticall, sendCollect, sendMulticall]
  );
};
