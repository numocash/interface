import type { CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber, constants, utils } from "ethers";
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
import { useBalance } from "../../../../hooks/useBalance";
import {
  isV3,
  useMostLiquidMarket,
} from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../lib/constants";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerShare,
} from "../../../../lib/lendgineMath";
import { priceToFraction } from "../../../../lib/price";
import type { WrappedTokenInfo } from "../../../../lib/types/wrappedTokenInfo";
import type { BeetStage } from "../../../../utils/beet";
import { usePositionValue, useTradeDetails } from "../TradeDetailsInner";

export const useClose = ({
  amountOut,
}: {
  amountOut: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { address } = useAccount();
  const environment = useEnvironment();
  const settings = useSettings();

  const { selectedLendgine, base, quote } = useTradeDetails();
  const mostLiquid = useMostLiquidMarket([base, quote]);
  const { shares, amount0, amount1 } = useCloseAmounts({ amountOut });

  const native = useIsWrappedNative(selectedLendgine.token1);

  const approve = useApprove(shares, environment.base.lendgineRouter);

  return useMemo(() => {
    if (
      !shares ||
      !amount0 ||
      !amount1 ||
      !amountOut ||
      !mostLiquid.data ||
      !address
    )
      return undefined;

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
        shares: BigNumber.from(shares.quotient.toString()),
        collateralMin: BigNumber.from(
          amountOut
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        amount0Min: BigNumber.from(
          amount0
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        amount1Min: BigNumber.from(
          amount1
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        swapType: isV3(mostLiquid.data.pool) ? 1 : 0,
        swapExtraData: isV3(mostLiquid.data.pool)
          ? (utils.defaultAbiCoder.encode(
              ["tuple(uint24 fee)"],
              [
                {
                  fee: mostLiquid.data.pool.feeTier,
                },
              ]
            ) as Address)
          : constants.AddressZero,
        recipient: native ? constants.AddressZero : address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    const lendgineRouterContract = getContract({
      abi: lendgineRouterABI,
      address: environment.base.lendgineRouter,
    });

    const unwrapArgs = [
      BigNumber.from(
        amountOut
          .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
          .quotient.toString()
      ),
      address,
    ] as const;

    const title = `Sell ${selectedLendgine.token1.symbol}+`;

    const tx = native
      ? async () => {
          const config = await prepareWriteContract({
            abi: lendgineRouterABI,
            functionName: "multicall",
            address: environment.base.lendgineRouter,
            args: [
              [
                lendgineRouterContract.interface.encodeFunctionData(
                  "burn",
                  args
                ),
                lendgineRouterContract.interface.encodeFunctionData(
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
            abi: lendgineRouterABI,
            functionName: "burn",
            address: environment.base.lendgineRouter,
            args,
          });

          const data = await writeContract(config);
          return data;
        };

    return [
      approve.beetStage,
      {
        stageTitle: title,
        parallelTransactions: [
          {
            title: title,
            tx,
          },
        ],
      },
    ].filter((s): s is BeetStage => !!s);
  }, [
    address,
    amount0,
    amount1,
    amountOut,
    approve.beetStage,
    environment.base.lendgineRouter,
    mostLiquid.data,
    native,
    selectedLendgine.bound,
    selectedLendgine.token0.address,
    selectedLendgine.token0.decimals,
    selectedLendgine.token1.address,
    selectedLendgine.token1.decimals,
    selectedLendgine.token1.symbol,
    settings.maxSlippagePercent,
    settings.timeout,
    shares,
  ]);
};

export const useCloseAmounts = ({
  amountOut,
}: {
  amountOut: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { selectedLendgine } = useTradeDetails();
  const { address } = useAccount();

  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const balanceQuery = useBalance(selectedLendgine.lendgine, address);
  const positionValue = usePositionValue(selectedLendgine);

  const t = getT();

  return useMemo(() => {
    if (
      !lendgineInfoQuery.data ||
      !balanceQuery.data ||
      !amountOut ||
      !positionValue
    )
      return {};

    const updateLendgineInfo = accruedLendgineInfo(
      selectedLendgine,
      lendgineInfoQuery.data,
      t
    );
    const shares = balanceQuery.data.multiply(amountOut).divide(positionValue);

    const liquidityMinted = liquidityPerShare(
      selectedLendgine,
      updateLendgineInfo
    ).quote(shares);

    const amount0 = updateLendgineInfo.reserve0
      .multiply(liquidityMinted)
      .divide(updateLendgineInfo.totalLiquidity);

    const amount1 = updateLendgineInfo.reserve1
      .multiply(liquidityMinted)
      .divide(updateLendgineInfo.totalLiquidity);

    return { shares, liquidityMinted, amount0, amount1 };
  }, [
    amountOut,
    balanceQuery.data,
    lendgineInfoQuery.data,
    positionValue,
    selectedLendgine,
    t,
  ]);
};
