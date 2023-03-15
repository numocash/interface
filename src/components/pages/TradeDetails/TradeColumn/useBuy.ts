import { defaultAbiCoder } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address, usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLendgineRouter,
  useLendgineRouterMint,
  useLendgineRouterMulticall,
  usePrepareLendgineRouterMint,
  usePrepareLendgineRouterMulticall,
} from "../../../../generated";
import type { HookArg } from "../../../../hooks/useBalance";
import { useApprove } from "../../../../hooks/useApproval";
import {
  isV3,
  useMostLiquidMarket,
} from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import type { WrappedTokenInfo } from "../../../../hooks/useTokens2";
import type { BeetStage } from "../../../../utils/beet";
import { isLongLendgine } from "../../../../utils/lendgines";
import { borrowRate } from "../../../../utils/Numoen/jumprate";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../utils/Numoen/lendgineMath";
import { priceToFraction } from "../../../../utils/Numoen/price";
import {
  determineBorrowAmount,
  ONE_HUNDRED_PERCENT,
  scale,
} from "../../../../utils/Numoen/trade";
import { useTradeDetails } from "../TradeDetailsInner";

export const useBuy = ({
  amountIn,
}: {
  amountIn: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { selectedLendgine, base, quote } = useTradeDetails();
  const { borrowAmount, liquidity, shares } = useBuyAmounts({ amountIn });
  const { address } = useAccount();
  const settings = useSettings();
  const mostLiquid = useMostLiquidMarket([base, quote]);
  const environment = useEnvironment();

  const lendgineRouterContract = useLendgineRouter({
    address: environment.base.lendgineRouter,
  });

  const isLong = isLongLendgine(selectedLendgine, base);
  const approve = useApprove(amountIn, environment.base.lendgineRouter);
  const native = useIsWrappedNative(selectedLendgine.token1);

  const { args } = useMemo(() => {
    if (
      !borrowAmount ||
      !liquidity ||
      !shares ||
      !address ||
      !amountIn ||
      !mostLiquid.data
    )
      return {};

    const args = [
      {
        token0: getAddress(selectedLendgine.token0.address),
        token1: getAddress(selectedLendgine.token1.address),
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
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        swapType: isV3(mostLiquid.data.pool) ? 1 : 0,
        swapExtraData: isV3(mostLiquid.data.pool)
          ? (defaultAbiCoder.encode(
              ["tuple(uint24 fee)"],
              [
                {
                  fee: +mostLiquid.data.pool.feeTier,
                },
              ]
            ) as Address)
          : AddressZero,
        recipient: address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    return { args, native };
  }, [
    address,
    amountIn,
    borrowAmount,
    liquidity,
    mostLiquid.data,
    native,
    selectedLendgine.bound,
    selectedLendgine.token0.address,
    selectedLendgine.token0.decimals,
    selectedLendgine.token1.address,
    selectedLendgine.token1.decimals,
    settings.maxSlippagePercent,
    settings.timeout,
    shares,
  ]);

  const prepareMint = usePrepareLendgineRouterMint({
    address: environment.base.lendgineRouter,
    args: args,
    enabled: !!args,
    staleTime: Infinity,
  });
  const sendMint = useLendgineRouterMint(prepareMint.config);

  const prepareMulticall = usePrepareLendgineRouterMulticall({
    address: environment.base.lendgineRouter,
    staleTime: Infinity,
    enabled: !!args && !!lendgineRouterContract && !!native,
    args:
      !!args && !!lendgineRouterContract
        ? [
            [
              lendgineRouterContract.interface.encodeFunctionData("mint", args),
              lendgineRouterContract.interface.encodeFunctionData("refundETH"),
            ] as `0x${string}`[],
          ]
        : undefined,
    overrides: {
      value: args?.[0].amountIn,
    },
  });
  const sendMulticall = useLendgineRouterMulticall(prepareMulticall.config);

  return useMemo(
    () =>
      native
        ? [
            {
              stageTitle: `Buy ${quote.symbol}${isLong ? "+" : "-"}`,
              parallelTransactions: [
                {
                  title: `Buy ${quote.symbol}${isLong ? "+" : "-"}`,
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
        : ((
            [
              approve.beetStage,
              {
                stageTitle: `Buy ${quote.symbol}${isLong ? "+" : "-"}`,
                parallelTransactions: [
                  {
                    title: `Buy ${quote.symbol}${isLong ? "+" : "-"}`,
                    tx: {
                      prepare: prepareMint as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendMint,
                    },
                  },
                ],
              },
            ] as const
          ).filter((s) => !!s) as BeetStage[]),
    [
      approve.beetStage,
      isLong,
      native,
      prepareMint,
      prepareMulticall,
      quote.symbol,
      sendMint,
      sendMulticall,
    ]
  );
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
