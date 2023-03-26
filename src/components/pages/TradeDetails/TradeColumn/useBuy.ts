import { useMutation } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";
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

import { lendgineRouterABI } from "../../../../abis/lendgineRouter";
import { toaster } from "../../../../AppWithProviders";
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
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../lib/constants";
import { borrowRate } from "../../../../lib/jumprate";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../lib/lendgineMath";
import { isLongLendgine } from "../../../../lib/lendgines";
import { priceToFraction } from "../../../../lib/price";
import { determineBorrowAmount } from "../../../../lib/trade";
import type { WrappedTokenInfo } from "../../../../lib/types/wrappedTokenInfo";
import type { UniswapV2Pool } from "../../../../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../../../../services/graphql/uniswapV3";
import { useTradeDetails } from "../TradeDetailsInner";

export const useBuy = ({
  amountIn,
}: {
  amountIn: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const environment = useEnvironment();
  const settings = useSettings();
  const { selectedLendgine, base, quote } = useTradeDetails();
  const { address } = useAccount();

  const invalidate = useInvalidateCall();
  const awaitTX = useAwaitTX();

  const { borrowAmount, shares } = useBuyAmounts({ amountIn });
  const mostLiquid = useMostLiquidMarket([base, quote]);

  const isLong = isLongLendgine(selectedLendgine, base);
  const approve = useApprove(amountIn, environment.base.lendgineRouter);

  const native = useIsWrappedNative(selectedLendgine.token1);

  const lendgineRouterContract = getContract({
    abi: lendgineRouterABI,
    address: environment.base.lendgineRouter,
  });

  const title = `Buy ${quote.symbol}${isLong ? "+" : "-"}`;
  const mintTitle = useMemo(
    () => `Buy ${quote.symbol}${isLong ? "+" : "-"}`,
    [isLong, quote.symbol]
  );

  // mint side effects: allowance, token1balance,  long balance

  const approveMutation = useMutation({
    mutationFn: async (approveTx: () => Promise<SendTransactionResult>) => {
      const transaction = await approveTx();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.txLoading("approve", approve.title!, "1/2", "", transaction.hash);

      return await Promise.race([
        transaction.wait(),
        awaitTX(transaction.hash),
      ]);
    },
    onMutate: () =>
      toaster.txLoading(
        "approve",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        approve.title!,
        "1/2",
        "Sending transaction"
      ),
    onError: () =>
      toaster.txError(
        "approve",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        approve.title!,
        "1/2",
        "Error sending transaction"
      ),
    onSuccess: async (data) => {
      toaster.txSuccess(
        "approve",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        approve.title!,
        "1/2",
        "",
        data.transactionHash
      );
      await invalidate(
        getAllowanceRead(
          selectedLendgine.token1,
          address ?? constants.AddressZero,
          environment.base.lendgineRouter
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
    }: {
      borrowAmount: CurrencyAmount<WrappedTokenInfo>;
      shares: CurrencyAmount<Token>;
      address: Address;
      amountIn: CurrencyAmount<WrappedTokenInfo>;
      mostLiquidPool: UniswapV2Pool | UniswapV3Pool;
    }) => {
      const args = [
        {
          token0: utils.getAddress(selectedLendgine.token0.address),
          token1: utils.getAddress(selectedLendgine.token1.address),
          token0Exp: BigNumber.from(selectedLendgine.token0.decimals),
          token1Exp: BigNumber.from(selectedLendgine.token1.decimals),
          upperBound: BigNumber.from(
            priceToFraction(selectedLendgine.bound)
              .multiply(scale)
              .quotient.toString()
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
              address: environment.base.lendgineRouter,
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
              address: environment.base.lendgineRouter,
              args,
            });
            return await writeContract(config);
          };

      const transaction = await tx();

      toaster.txLoading("mint", mintTitle, "2/2", "", transaction.hash);

      return await Promise.race([
        transaction.wait(),
        awaitTX(transaction.hash),
      ]);
    },
    onMutate: () =>
      toaster.txLoading("mint", mintTitle, "2/2", "Sending transaction"),
    onError: () =>
      toaster.txError("mint", mintTitle, "2/2", "Error sending transaction"),
    onSuccess: async (data, input) => {
      toaster.txSuccess("mint", mintTitle, "2/2", "", data.transactionHash);
      await Promise.all([
        invalidate(
          getAllowanceRead(
            input.amountIn.currency,
            input.address,
            environment.base.lendgineRouter
          )
        ),
        invalidate(getBalanceRead(input.amountIn.currency, input.address)),
        invalidate(getBalanceRead(input.shares.currency, input.address)),
      ]);
    },
  });

  return useMemo(() => {
    if (
      !borrowAmount ||
      !shares ||
      !address ||
      !amountIn ||
      !mostLiquid.data ||
      approve.status !== "success"
    )
      return undefined;

    return async () => {
      approve.tx && (await approveMutation.mutateAsync(approve.tx));
      await mintMutation.mutateAsync({
        borrowAmount,
        shares,
        address,
        amountIn,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mostLiquidPool: mostLiquid.data!.pool,
      });
    };

    const tx = {
      ...mutation,
      mutateAsync: async () =>
        mutation.mutateAsync({
          borrowAmount,
          shares,
          address,
          amountIn,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          mostLiquidPool: mostLiquid.data!.pool,
        }),
    };

    return [
      !native ? approve.beetStage : null,
      {
        stageTitle: title,
        parallelTransactions: [
          {
            title,
            tx,
          },
        ],
      },
    ].filter((s): s is BeetStage => !!s);
  }, [
    address,
    amountIn,
    approve.beetStage,
    borrowAmount,
    isLong,
    mostLiquid.data,
    mutation,
    native,
    quote.symbol,
    shares,
  ]);
};

export const useBuyAmounts = ({
  amountIn,
}: {
  amountIn: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { selectedLendgine, price, base, quote } = useTradeDetails();
  const mostLiquidQuery = useMostLiquidMarket([base, quote] as const);
  const selectedLendgineInfo = useLendgine(selectedLendgine);
  const t = getT();
  const settings = useSettings();

  return useMemo(() => {
    if (!selectedLendgineInfo.data || !mostLiquidQuery.data) return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      selectedLendgine,
      selectedLendgineInfo.data,
      t
    );

    const liqPerShare = liquidityPerShare(
      selectedLendgine,
      updatedLendgineInfo
    );
    const liqPerCol = liquidityPerCollateral(selectedLendgine);

    const borrowAmount = amountIn
      ? determineBorrowAmount(
          amountIn,
          selectedLendgine,
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
          : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
      ),
      totalLiquidityBorrowed: updatedLendgineInfo.totalLiquidityBorrowed.add(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
      ),
    });

    return { borrowAmount, liquidity, shares, bRate };
  }, [
    amountIn,
    mostLiquidQuery.data,
    price,
    selectedLendgine,
    selectedLendgineInfo.data,
    settings.maxSlippagePercent,
    t,
  ]);
};
