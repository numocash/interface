import { defaultAbiCoder } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address } from "wagmi";
import { useAccount } from "wagmi";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { lendgineRouterABI } from "../../../../abis/lendgineRouter";
import { useSettings } from "../../../../contexts/settings";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import type { HookArg } from "../../../../hooks/internal/utils";
import { useApprove } from "../../../../hooks/useApprove";
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
import type { BeetStage } from "../../../../utils/beet";
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

  const isLong = isLongLendgine(selectedLendgine, base);
  const approve = useApprove(amountIn, environment.base.lendgineRouter);
  const native = useIsWrappedNative(selectedLendgine.token1);

  return useMemo(() => {
    if (
      !borrowAmount ||
      !liquidity ||
      !shares ||
      !address ||
      !amountIn ||
      !mostLiquid.data
    )
      return undefined;

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

    const lendgineRouterContract = getContract({
      abi: lendgineRouterABI,
      address: environment.base.lendgineRouter,
    });

    const title = `Buy ${quote.symbol}${isLong ? "+" : "-"}`;

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
          const data = await writeContract(config);
          return data;
        }
      : async () => {
          const config = await prepareWriteContract({
            abi: lendgineRouterABI,
            functionName: "mint",
            address: environment.base.lendgineRouter,
            args,
          });
          const data = await writeContract(config);
          return data;
        };

    return [
      native ? approve.beetStage : null,
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
    environment.base.lendgineRouter,
    isLong,
    liquidity,
    mostLiquid.data,
    native,
    quote.symbol,
    selectedLendgine,
    settings.maxSlippagePercent,
    settings.timeout,
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
