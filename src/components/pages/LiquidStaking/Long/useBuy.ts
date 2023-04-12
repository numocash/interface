import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Price, Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import type { Address } from "wagmi";
import { useAccount } from "wagmi";
import type { SendTransactionResult } from "wagmi/actions";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { toaster } from "../../../../AppWithProviders";
import { lendgineRouterABI } from "../../../../abis/lendgineRouter";
import { useSettings } from "../../../../contexts/settings";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import type { HookArg } from "../../../../hooks/internal/types";
import { useInvalidateCall } from "../../../../hooks/internal/useInvalidateCall";
import { getAllowanceRead } from "../../../../hooks/useAllowance";
import { useApprove } from "../../../../hooks/useApprove";
import { useAwaitTX } from "../../../../hooks/useAwaitTX";
import { getBalanceRead } from "../../../../hooks/useBalance";
import {
  isV3,
  useMostLiquidMarket,
} from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../lib/constants";
import { borrowRate } from "../../../../lib/jumprate";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../lib/lendgineMath";
import { priceToFraction } from "../../../../lib/price";
import { determineBorrowAmount } from "../../../../lib/trade";
import type { WrappedTokenInfo } from "../../../../lib/types/wrappedTokenInfo";
import type { UniswapV2Pool } from "../../../../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../../../../services/graphql/uniswapV3";
import type { BeetStage, TxToast } from "../../../../utils/beet";

export const useBuy = ({
  amountIn,
  price,
}: {
  amountIn: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  price: HookArg<Price<WrappedTokenInfo, WrappedTokenInfo>>;
}) => {
  const environment = useEnvironment();
  const settings = useSettings();
  // matic = base
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const base = environment.interface.liquidStaking!.base;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const { address } = useAccount();

  const invalidate = useInvalidateCall();
  const queryClient = useQueryClient();
  const awaitTX = useAwaitTX();

  const { borrowAmount, shares } = useBuyAmounts({ amountIn, price });
  const mostLiquid = useMostLiquidMarket({
    base: lendgine.token1,
    quote: lendgine.token0,
  });

  const isLong = true;
  const approve = useApprove(amountIn, base.lendgineRouter);

  const native = false;

  const lendgineRouterContract = getContract({
    abi: lendgineRouterABI,
    address: base.lendgineRouter,
  });

  const title = useMemo(
    () => `Buy ${lendgine.token1.symbol}${isLong ? "+" : "-"}`,
    [isLong, lendgine.token1.symbol]
  );

  const approveMutation = useMutation({
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
          base.lendgineRouter
        )
      );
    },
  });

  const mintMutation = useMutation({
    mutationFn: async ({
      borrowAmount,
      shares,
      address,
      amountIn,
      mostLiquidPool,
      toast,
    }: {
      borrowAmount: CurrencyAmount<WrappedTokenInfo>;
      shares: CurrencyAmount<Token>;
      address: Address;
      amountIn: CurrencyAmount<WrappedTokenInfo>;
      mostLiquidPool: UniswapV2Pool | UniswapV3Pool;
    } & { toast: TxToast }) => {
      const args = [
        {
          token0: utils.getAddress(lendgine.token0.address),
          token1: utils.getAddress(lendgine.token1.address),
          token0Exp: BigNumber.from(lendgine.token0.decimals),
          token1Exp: BigNumber.from(lendgine.token1.decimals),
          upperBound: BigNumber.from(
            priceToFraction(lendgine.bound).multiply(scale).quotient.toString()
          ),
          amountIn: BigNumber.from(amountIn.quotient.toString()),
          amountBorrow: BigNumber.from(borrowAmount.quotient.toString()),
          sharesMin: BigNumber.from(
            shares
              .multiply(
                ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
              )
              .quotient.toString()
          ),
          swapType: isV3(mostLiquidPool) ? 1 : 0,
          swapExtraData: isV3(mostLiquidPool)
            ? (utils.defaultAbiCoder.encode(
                ["tuple(uint24 fee)"],
                [
                  {
                    fee: +mostLiquidPool.feeTier,
                  },
                ]
              ) as Address)
            : constants.AddressZero,
          recipient: address,
          deadline: BigNumber.from(
            Math.round(Date.now() / 1000) + settings.timeout * 60
          ),
        },
      ] as const;

      const tx = native
        ? async () => {
            const config = await prepareWriteContract({
              abi: lendgineRouterABI,
              functionName: "multicall",
              address: base.lendgineRouter,
              args: [
                [
                  lendgineRouterContract.interface.encodeFunctionData(
                    "mint",
                    args
                  ),
                  lendgineRouterContract.interface.encodeFunctionData(
                    "refundETH"
                  ),
                ] as `0x${string}`[],
              ],
              overrides: {
                value: args[0].amountIn,
              },
            });
            return await writeContract(config);
          }
        : async () => {
            const config = await prepareWriteContract({
              abi: lendgineRouterABI,
              functionName: "mint",
              address: base.lendgineRouter,
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
          getAllowanceRead(
            input.amountIn.currency,
            input.address,
            base.lendgineRouter
          )
        ),
        invalidate(getBalanceRead(input.amountIn.currency, input.address)),
        invalidate(getBalanceRead(input.shares.currency, input.address)),
        queryClient.invalidateQueries({
          queryKey: ["user trades", input.address],
        }),
      ]);
    },
  });

  return useMemo(() => {
    if (approve.status === "loading") return { status: "loading" } as const;
    if (
      !borrowAmount ||
      !shares ||
      !address ||
      !amountIn ||
      !mostLiquid.data ||
      approve.status === "error"
    )
      return { status: "error" } as const;

    return {
      status: "success",
      data: (
        [
          !native && approve.tx
            ? {
                title: approve.title,
                parallelTxs: [
                  {
                    title: approve.title,
                    description: approve.title,
                    callback: (toast: TxToast) =>
                      approveMutation.mutateAsync({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        approveTx: approve.tx!,
                        toast,
                      }),
                  },
                ],
              }
            : undefined,
          {
            title,
            parallelTxs: [
              {
                title,
                description: title,
                callback: (toast: TxToast) =>
                  mintMutation.mutateAsync({
                    borrowAmount,
                    shares,
                    address,
                    amountIn,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    mostLiquidPool: mostLiquid.data.pool,
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
    amountIn,
    approve.status,
    approve.title,
    approve.tx,
    approveMutation,
    borrowAmount,
    mintMutation,
    mostLiquid.data,
    native,
    shares,
    title,
  ]);
};

export const useBuyAmounts = ({
  amountIn,
  price,
}: {
  amountIn: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  price: HookArg<Price<WrappedTokenInfo, WrappedTokenInfo>>;
}) => {
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const mostLiquidQuery = useMostLiquidMarket({
    base: lendgine.token1,
    quote: lendgine.token0,
  });
  const selectedLendgineInfo = useLendgine(lendgine);
  const t = getT();
  const settings = useSettings();

  return useMemo(() => {
    if (!selectedLendgineInfo.data || !mostLiquidQuery.data || !price)
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      lendgine,
      selectedLendgineInfo.data,
      t
    );

    const liqPerShare = liquidityPerShare(lendgine, updatedLendgineInfo);
    const liqPerCol = liquidityPerCollateral(lendgine);

    const borrowAmount = amountIn
      ? determineBorrowAmount(
          amountIn,
          lendgine,
          updatedLendgineInfo,
          { pool: mostLiquidQuery.data.pool, price },
          settings.maxSlippagePercent
        )
      : undefined;

    const liquidity =
      borrowAmount && amountIn
        ? liqPerCol.quote(borrowAmount.add(amountIn))
        : undefined;

    const shares = liquidity
      ? liqPerShare.invert().quote(liquidity)
      : undefined;

    const bRate = borrowRate({
      totalLiquidity: updatedLendgineInfo.totalLiquidity.subtract(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(lendgine.lendgine, 0)
      ),
      totalLiquidityBorrowed: updatedLendgineInfo.totalLiquidityBorrowed.add(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(lendgine.lendgine, 0)
      ),
    });

    return { borrowAmount, liquidity, shares, bRate };
  }, [
    amountIn,
    lendgine,
    mostLiquidQuery.data,
    price,
    selectedLendgineInfo.data,
    settings.maxSlippagePercent,
    t,
  ]);
};
