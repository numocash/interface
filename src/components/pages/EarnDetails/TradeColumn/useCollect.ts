import { BigNumber, constants } from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { liquidityManagerABI } from "../../../../abis/liquidityManager";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import {
  accruedLendgineInfo,
  accruedLendginePositionInfo,
  getT,
} from "../../../../lib/lendgineMath";
import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../../../lib/types/lendgine";

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

  const native = useIsWrappedNative(lendgine.token1);

  return useMemo(() => {
    if (!address) return undefined;
    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    const updatedPosition = accruedLendginePositionInfo(updatedInfo, position);

    const args = [
      {
        lendgine: lendgine.address,
        recipient: native ? constants.AddressZero : address,
        amountRequested: BigNumber.from(
          updatedPosition.tokensOwed.quotient.toString()
        ),
      },
    ] as const;

    const unwrapArgs = [BigNumber.from(0), address] as const; // safe to be zero because the collect estimation will fail

    const liquidityManagerContract = getContract({
      abi: liquidityManagerABI,
      address: environment.base.liquidityManager,
    });

    const title = "Collect interest";

    const tx = native
      ? async () => {
          const config = await prepareWriteContract({
            abi: liquidityManagerABI,
            address: environment.base.liquidityManager,
            functionName: "multicall",
            args: [
              [
                liquidityManagerContract.interface.encodeFunctionData(
                  "collect",
                  args
                ),
                liquidityManagerContract.interface.encodeFunctionData(
                  "unwrapWETH",
                  unwrapArgs
                ),
              ] as `0x${string}`[],
            ],
          });
          const data = await writeContract(config);
          return data;
        }
      : async () => {
          const config = await prepareWriteContract({
            abi: liquidityManagerABI,
            address: environment.base.liquidityManager,
            functionName: "collect",
            args,
          });
          const data = await writeContract(config);
          return data;
        };

    return [
      {
        stageTitle: title,
        parallelTransactions: [
          {
            title,
            tx,
          },
        ],
      },
    ] as const;
  }, [
    address,
    environment.base.liquidityManager,
    lendgine,
    lendgineInfo,
    native,
    position,
    t,
  ]);
};
