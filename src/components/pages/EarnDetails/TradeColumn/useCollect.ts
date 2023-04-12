import { useMutation } from "@tanstack/react-query";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import type { Address } from "abitype";
import { BigNumber, constants } from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { toaster } from "../../../../AppWithProviders";
import { liquidityManagerABI } from "../../../../abis/liquidityManager";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useInvalidateCall } from "../../../../hooks/internal/useInvalidateCall";
import { useAwaitTX } from "../../../../hooks/useAwaitTX";
import { getBalanceRead } from "../../../../hooks/useBalance";
import { getLendginePositionRead } from "../../../../hooks/useLendginePosition";
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
import type { WrappedTokenInfo } from "../../../../lib/types/wrappedTokenInfo";
import type { BeetStage, TxToast } from "../../../../utils/beet";

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

  const awaitTX = useAwaitTX();
  const invalidate = useInvalidateCall();

  const native = useIsWrappedNative(lendgine.token1);
  const title = "Collect interest";

  const mutate = useMutation({
    mutationFn: async ({
      address,
      tokensOwed,
      toast,
    }: { tokensOwed: CurrencyAmount<WrappedTokenInfo>; address: Address } & {
      toast: TxToast;
    }) => {
      const args = [
        {
          lendgine: lendgine.address,
          recipient: native ? constants.AddressZero : address,
          amountRequested: BigNumber.from(tokensOwed.quotient.toString()),
        },
      ] as const;

      const unwrapArgs = [BigNumber.from(0), address] as const; // safe to be zero because the collect estimation will fail

      const liquidityManagerContract = getContract({
        abi: liquidityManagerABI,
        address: environment.base.liquidityManager,
      });

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
            return await writeContract(config);
          }
        : async () => {
            const config = await prepareWriteContract({
              abi: liquidityManagerABI,
              address: environment.base.liquidityManager,
              functionName: "collect",
              args,
            });
            return await writeContract(config);
          };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await Promise.all([
        invalidate(
          getLendginePositionRead(
            lendgine,
            input.address,
            environment.base.liquidityManager
          )
        ),
        invalidate(getBalanceRead(lendgine.token1, input.address)),
      ]);
    },
  });

  return useMemo(() => {
    if (!address) return { status: "error" } as const;
    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    const updatedPosition = accruedLendginePositionInfo(updatedInfo, position);

    return {
      status: "success",
      data: [
        {
          title,
          parallelTxs: [
            {
              title,
              description: title,
              callback: (toast: TxToast) =>
                mutate.mutateAsync({
                  tokensOwed: updatedPosition.tokensOwed,
                  address: address,
                  toast,
                }),
            },
          ],
        },
      ],
    } as const satisfies { data: readonly BeetStage[]; status: "success" };
  }, [address, lendgine, lendgineInfo, mutate, position, t]);
};
