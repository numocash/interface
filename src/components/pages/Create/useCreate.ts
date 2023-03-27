import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { Token } from "@uniswap/sdk-core";
import type { Address } from "abitype";
import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import type { SendTransactionResult } from "wagmi/actions";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { factoryABI } from "../../../abis/factory";
import { liquidityManagerABI } from "../../../abis/liquidityManager";
import { toaster } from "../../../AppWithProviders";
import { useSettings } from "../../../contexts/settings";
import { useEnvironment } from "../../../contexts/useEnvironment";
import type { HookArg } from "../../../hooks/internal/types";
import { useInvalidateCall } from "../../../hooks/internal/useInvalidateCall";
import { getAllowanceRead } from "../../../hooks/useAllowance";
import { useApprove } from "../../../hooks/useApprove";
import { useAwaitTX } from "../../../hooks/useAwaitTX";
import { getBalanceRead } from "../../../hooks/useBalance";
import { useChain } from "../../../hooks/useChain";
import { useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { getLendginePositionRead } from "../../../hooks/useLendginePosition";
import { useIsWrappedNative } from "../../../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../../../lib/constants";
import {
  fractionToPrice,
  priceToFraction,
  priceToReserves,
} from "../../../lib/price";
import type { Lendgine } from "../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import type { BeetStage, BeetTx, TxToast } from "../../../utils/beet";

export const useCreate = ({
  token0Input,
  token1Input,
  bound,
}: {
  token0Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  token1Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  bound: HookArg<Fraction>;
}) => {
  const environment = useEnvironment();
  const settings = useSettings();
  const { address } = useAccount();
  const chainID = useChain();

  const awaitTX = useAwaitTX();
  const invalidate = useInvalidateCall();
  const queryClient = useQueryClient();

  const priceQuery = useMostLiquidMarket(
    !!token0Input && !!token1Input
      ? ([token0Input.currency, token1Input.currency] as const)
      : null
  );

  const native0 = useIsWrappedNative(token0Input?.currency);
  const native1 = useIsWrappedNative(token1Input?.currency);

  const approve0 = useApprove(token0Input, environment.base.liquidityManager);
  const approve1 = useApprove(token1Input, environment.base.liquidityManager);

  const liquidityManagerContract = getContract({
    abi: liquidityManagerABI,
    address: environment.base.liquidityManager,
  });

  const createTitle = `New ${token1Input?.currency.symbol ?? ""} + ${
    token0Input?.currency.symbol ?? ""
  } market`;

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
      token0Input &&
        (await invalidate(
          getAllowanceRead(
            token0Input.currency,
            address ?? constants.AddressZero,
            environment.base.lendgineRouter
          )
        ));
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
      token1Input &&
        (await invalidate(
          getAllowanceRead(
            token1Input.currency,
            address ?? constants.AddressZero,
            environment.base.lendgineRouter
          )
        ));
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({
      lendgine,
      toast,
    }: { lendgine: Lendgine } & { toast: TxToast }) => {
      const createArgs = [
        utils.getAddress(lendgine.token0.address),
        utils.getAddress(lendgine.token1.address),
        lendgine.token0.decimals,
        lendgine.token1.decimals,
        BigNumber.from(
          priceToFraction(lendgine.bound).multiply(scale).quotient.toString()
        ),
      ] as const;

      const config = await prepareWriteContract({
        abi: factoryABI,
        functionName: "createLendgine",
        address: environment.base.factory,
        args: createArgs,
      });
      const transaction = await writeContract(config);

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await queryClient.invalidateQueries({ queryKey: ["existing lendgines"] });
    },
  });

  const depositMutation = useMutation({
    mutationFn: async ({
      lendgine,
      liquidity,
      token0Input,
      token1Input,
      address,

      toast,
    }: {
      lendgine: Lendgine;
      liquidity: CurrencyAmount<Token>;
      token0Input: CurrencyAmount<WrappedTokenInfo>;
      token1Input: CurrencyAmount<WrappedTokenInfo>;
      address: Address;
    } & {
      toast: TxToast;
    }) => {
      const args = [
        {
          token0: utils.getAddress(lendgine.token0.address),
          token1: utils.getAddress(lendgine.token1.address),
          token0Exp: BigNumber.from(lendgine.token0.decimals),
          token1Exp: BigNumber.from(lendgine.token1.decimals),
          upperBound: BigNumber.from(
            priceToFraction(lendgine.bound).multiply(scale).quotient.toString()
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

      const tx =
        native0 || native0
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
              const data = await writeContract(config);
              return data;
            }
          : async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "addLiquidity",
                address: environment.base.liquidityManager,
                args,
              });
              const data = await writeContract(config);
              return data;
            };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return awaitTX(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await Promise.all([
        invalidate(
          getLendginePositionRead(
            input.lendgine,
            input.address,
            environment.base.liquidityManager
          )
        ),
        invalidate(
          getAllowanceRead(
            input.token0Input.currency,
            input.address,
            environment.base.liquidityManager
          )
        ),
        invalidate(
          getAllowanceRead(
            input.token1Input.currency,
            input.address,
            environment.base.liquidityManager
          )
        ),
        invalidate(getBalanceRead(input.token0Input.currency, input.address)),
        invalidate(getBalanceRead(input.token1Input.currency, input.address)),
      ]);
    },
  });

  return useMemo(() => {
    if (approve0.status === "loading" || approve1.status === "loading")
      return { status: "loading" } as const;
    if (
      !token0Input ||
      !token1Input ||
      !address ||
      !priceQuery.data ||
      !bound ||
      approve0.status === "error" ||
      approve1.status === "error"
    )
      return { status: "error" } as const;

    const lendgine: Lendgine = {
      token0: token0Input.currency,
      token0Exp: token0Input.currency.decimals,
      token1: token1Input.currency,
      token1Exp: token1Input.currency.decimals,
      lendgine: new Token(chainID, constants.AddressZero, 18),
      address: constants.AddressZero,
      bound: fractionToPrice(bound, token1Input.currency, token0Input.currency),
    };

    const { token0Amount } = priceToReserves(lendgine, priceQuery.data.price);

    const liquidity = token0Amount.invert().quote(token0Input);

    return {
      status: "success",
      data: (
        [
          {
            title: "Approve tokens and create market",
            parallelTxs: [
              !native0 && approve0.tx
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
              !native1 && approve1.tx
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
              {
                title: createTitle,
                description: createTitle,
                callback: (toast: TxToast) =>
                  createMutation.mutateAsync({ lendgine, toast }),
              },
            ].filter((btx): btx is BeetTx => !!btx),
          },
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
                    liquidity,
                    lendgine,
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
    bound,
    chainID,
    createMutation,
    createTitle,
    depositMutation,
    native0,
    native1,
    priceQuery.data,
    title,
    token0Input,
    token1Input,
  ]);
};

export const useDepositAmounts = ({
  amount,
  token0,
  token1,
  bound,
}: {
  amount: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  token0: HookArg<WrappedTokenInfo>;
  token1: HookArg<WrappedTokenInfo>;
  bound: HookArg<Fraction>;
}) => {
  const chainID = useChain();

  const priceQuery = useMostLiquidMarket(
    !!token0 && !!token1 ? ([token0, token1] as const) : null
  );
  return useMemo(() => {
    if (!amount || !token0 || !token1 || !bound) return {};
    if (!priceQuery.data)
      return {
        token0Input: amount.currency.equals(token0) ? amount : undefined,
        token1Input: amount.currency.equals(token1) ? amount : undefined,
      };

    if (priceToFraction(priceQuery.data.price).greaterThan(bound))
      return {
        token0Input: amount.currency.equals(token0) ? amount : undefined,
        token1Input: amount.currency.equals(token1) ? amount : undefined,
      };

    const lendgine: Lendgine = {
      token0,
      token0Exp: token0.decimals,
      token1,
      token1Exp: token1.decimals,
      lendgine: new Token(chainID, constants.AddressZero, 18),
      address: constants.AddressZero,
      bound: fractionToPrice(bound, token1, token0),
    };

    const { token0Amount, token1Amount } = priceToReserves(
      lendgine,
      priceQuery.data.price
    );

    const liquidity = amount.currency.equals(lendgine.token0)
      ? token0Amount.invert().quote(amount)
      : token1Amount.invert().quote(amount);

    const token0Input = token0Amount.quote(liquidity);
    const token1Input = token1Amount.quote(liquidity);

    return {
      token0Input,
      token1Input,
    };
  }, [amount, bound, chainID, priceQuery.data, token0, token1]);
};
