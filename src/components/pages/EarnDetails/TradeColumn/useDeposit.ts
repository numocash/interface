import { useMutation } from "@tanstack/react-query";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";
import { useAccount } from "wagmi";
import type {
  PrepareWriteContractConfig,
  SendTransactionResult,
} from "wagmi/actions";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { liquidityManagerABI } from "../../../../abis/liquidityManager";
import { toaster } from "../../../../AppWithProviders";
import { useSettings } from "../../../../contexts/settings";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import type { HookArg } from "../../../../hooks/internal/types";
import { useInvalidateCall } from "../../../../hooks/internal/useInvalidateCall";
import { getAllowanceRead } from "../../../../hooks/useAllowance";
import { useApprove } from "../../../../hooks/useApprove";
import { useAwaitTX } from "../../../../hooks/useAwaitTX";
import { useLendgine } from "../../../../hooks/useLendgine";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../lib/constants";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerPosition,
} from "../../../../lib/lendgineMath";
import { isLongLendgine } from "../../../../lib/lendgines";
import {
  invert,
  priceToFraction,
  priceToReserves,
} from "../../../../lib/price";
import type { Lendgine, LendgineInfo } from "../../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../../lib/types/wrappedTokenInfo";
import type { BeetStage, BeetTx, TxToast } from "../../../../utils/beet";
import { useEarnDetails } from "../EarnDetailsInner";

export const useDeposit = ({
  token0Input,
  token1Input,
}: {
  token0Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  token1Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { price, selectedLendgine: lendgine, base } = useEarnDetails();
  const t = getT();

  const environment = useEnvironment();
  const settings = useSettings();
  const { address } = useAccount();

  const awaitTX = useAwaitTX();
  const invalidate = useInvalidateCall();

  const native0 = useIsWrappedNative(lendgine.token0);
  const native1 = useIsWrappedNative(lendgine.token1);

  const approve0 = useApprove(token0Input, environment.base.liquidityManager);
  const approve1 = useApprove(token1Input, environment.base.liquidityManager);
  const lendgineInfo = useLendgine(lendgine);

  const liquidityManagerContract = getContract({
    abi: liquidityManagerABI,
    address: environment.base.liquidityManager,
  });

  const title = `Add ${token0Input?.currency.symbol ?? ""} / ${
    token1Input?.currency.symbol ?? ""
  } liquidty`;

  const approve0Mutation = useMutation({
    mutationFn: async ({
      approveTx,
      toast,
    }: { approveTx: () => Promise<SendTransactionResult> } & {
      toast: TxToast;
    }) => {
      const transaction = await approveTx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await invalidate(
        getAllowanceRead(
          lendgine.token0,
          address ?? constants.AddressZero,
          environment.base.lendgineRouter
        )
      );
    },
  });

  const approve1Mutation = useMutation({
    mutationFn: async ({
      approveTx,
      toast,
    }: { approveTx: () => Promise<SendTransactionResult> } & {
      toast: TxToast;
    }) => {
      const transaction = await approveTx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await invalidate(
        getAllowanceRead(
          lendgine.token1,
          address ?? constants.AddressZero,
          environment.base.lendgineRouter
        )
      );
    },
  });

  const depositMutation = useMutation({
    mutationFn: async ({
      token0Input,
      token1Input,
      lendgineInfo,
      address,
      toast,
    }: {
      token0Input: CurrencyAmount<WrappedTokenInfo>;
      token1Input: CurrencyAmount<WrappedTokenInfo>;
      address: Address;
      lendgineInfo: LendgineInfo<Lendgine>;
    } & { toast: TxToast }) => {
      let args:
        | PrepareWriteContractConfig<
            typeof liquidityManagerABI,
            "addLiquidity"
          >["args"]
        | undefined = undefined;
      if (lendgineInfo.totalLiquidity.equalTo(0)) {
        const isLong = isLongLendgine(lendgine, base);

        const { token0Amount } = priceToReserves(
          lendgine,
          isLong ? price : invert(price)
        );

        const liquidity = token0Amount.invert().quote(token0Input);

        args = [
          {
            token0: utils.getAddress(lendgine.token0.address),
            token1: utils.getAddress(lendgine.token1.address),
            token0Exp: BigNumber.from(lendgine.token0.decimals),
            token1Exp: BigNumber.from(lendgine.token1.decimals),
            upperBound: BigNumber.from(
              priceToFraction(lendgine.bound)
                .multiply(scale)
                .quotient.toString()
            ),
            liquidity: BigNumber.from(
              liquidity.multiply(999990).divide(1000000).quotient.toString()
            ),
            amount0Min: BigNumber.from(token0Input.quotient.toString()),
            amount1Min: BigNumber.from(token1Input.quotient.toString()),
            sizeMin: BigNumber.from(
              liquidity
                .multiply(
                  ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                )
                .quotient.toString()
            ),
            recipient: address,
            deadline: BigNumber.from(
              Math.round(Date.now() / 1000) + settings.timeout * 60
            ),
          },
        ] as const;
      } else {
        // determine percentage of pool
        const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
        const share = token0Input.divide(updatedInfo.reserve0);
        const liquidity = updatedInfo.totalLiquidity.multiply(share);
        const liqPerPosition = liquidityPerPosition(lendgine, updatedInfo);
        const positionSize = liqPerPosition.invert().quote(liquidity);

        args = [
          {
            token0: utils.getAddress(lendgine.token0.address),
            token1: utils.getAddress(lendgine.token1.address),
            token0Exp: BigNumber.from(lendgine.token0.decimals),
            token1Exp: BigNumber.from(lendgine.token1.decimals),
            upperBound: BigNumber.from(
              priceToFraction(lendgine.bound)
                .multiply(scale)
                .quotient.toString()
            ),
            liquidity: BigNumber.from(
              liquidity.multiply(999990).divide(1000000).quotient.toString()
            ),
            amount0Min: BigNumber.from(
              token0Input
                .multiply(
                  ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                )
                .quotient.toString()
            ),
            amount1Min: BigNumber.from(
              token1Input
                .multiply(
                  ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                )
                .quotient.toString()
            ),
            sizeMin: BigNumber.from(
              positionSize
                .multiply(
                  ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                )
                .quotient.toString()
            ),
            recipient: address,
            deadline: BigNumber.from(
              Math.round(Date.now() / 1000) + settings.timeout * 60
            ),
          },
        ] as const;
      }
      invariant(args);

      const tx =
        native0 || native1
          ? async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "multicall",
                address: environment.base.liquidityManager,
                args: [
                  [
                    liquidityManagerContract.interface.encodeFunctionData(
                      "addLiquidity",
                      args
                    ),
                    liquidityManagerContract.interface.encodeFunctionData(
                      "refundETH"
                    ),
                  ] as `0x${string}`[],
                ],
                overrides: {
                  value: native0
                    ? BigNumber.from(token0Input?.quotient.toString() ?? 0)
                    : BigNumber.from(token1Input?.quotient.toString() ?? 0),
                },
              });
              const data = writeContract(config);
              return data;
            }
          : async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "addLiquidity",
                args: args as PrepareWriteContractConfig<
                  typeof liquidityManagerABI,
                  "addLiquidity"
                >["args"],
                address: environment.base.liquidityManager,
              });
              const data = writeContract(config);
              return data;
            };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      // TODO: invalidate
    },
  });

  return useMemo(() => {
    if (approve0.status === "loading" || approve1.status === "loading")
      return { status: "loading" } as const;
    if (!token0Input || !token1Input || !lendgineInfo.data || !address)
      return { status: "error" } as const;

    return {
      status: "success",
      data: (
        [
          (native0 && approve0.tx) || (native1 && approve1.tx)
            ? {
                title: "Approve tokens",
                parallelTxs: [
                  native0 && approve0.tx
                    ? {
                        title: approve0.title,
                        description: approve0.title,
                        callback: (toast: TxToast) =>
                          approve0Mutation.mutateAsync({
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            approveTx: approve0.tx!,
                            toast,
                          }),
                      }
                    : undefined,
                  native1 && approve1.tx
                    ? {
                        title: approve1.title,
                        description: approve1.title,
                        callback: (toast: TxToast) =>
                          approve1Mutation.mutateAsync({
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            approveTx: approve1.tx!,
                            toast,
                          }),
                      }
                    : undefined,
                ].filter((btx): btx is BeetTx => !!btx),
              }
            : undefined,
          {
            title,
            parallelTxs: [
              {
                title,
                description: title,
                callback: (toast: TxToast) =>
                  depositMutation.mutateAsync({
                    token0Input,
                    token1Input,
                    address,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    lendgineInfo: lendgineInfo.data!,
                    toast,
                  }),
              },
            ],
          },
        ] as readonly (BeetStage | undefined)[]
      ).filter((s): s is BeetStage => !!s),
    } as const satisfies { data: readonly BeetStage[]; status: "success" };
  }, [
    address,
    approve0.status,
    approve0.title,
    approve0.tx,
    approve0Mutation,
    approve1.status,
    approve1.title,
    approve1.tx,
    approve1Mutation,
    depositMutation,
    lendgineInfo.data,
    native0,
    native1,
    title,
    token0Input,
    token1Input,
  ]);
};

export const useDepositAmounts = ({
  amount,
}: {
  amount: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { price, selectedLendgine: lendgine, base } = useEarnDetails();

  const lendgineInfo = useLendgine(lendgine);
  const t = getT();

  return useMemo(() => {
    if (!amount) return {};
    if (!lendgineInfo.data)
      return {
        token0Input: amount.currency.equals(lendgine.token0)
          ? amount
          : undefined,
        token1Input: amount.currency.equals(lendgine.token1)
          ? amount
          : undefined,
      };

    const isLong = isLongLendgine(lendgine, base);

    if (lendgineInfo.data.totalLiquidity.equalTo(0)) {
      const { token0Amount, token1Amount } = priceToReserves(
        lendgine,
        isLong ? price : invert(price)
      );

      const liquidity = amount.currency.equals(lendgine.token0)
        ? token0Amount.invert().quote(amount)
        : token1Amount.invert().quote(amount);

      console.log(liquidity.toSignificant(5));

      const token0Input = token0Amount.quote(liquidity);
      const token1Input = token1Amount.quote(liquidity);

      return {
        token0Input,
        token1Input,
      };
    }

    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo.data, t);
    const share = amount.currency.equals(lendgine.token0)
      ? amount.divide(updatedInfo.reserve0).asFraction
      : amount.divide(updatedInfo.reserve1).asFraction;

    return {
      token0Input: updatedInfo.reserve0.multiply(share),
      token1Input: updatedInfo.reserve1.multiply(share),
    };
  }, [amount, base, lendgine, lendgineInfo.data, price, t]);
};
