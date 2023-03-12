import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLiquidityManager,
  useLiquidityManagerMulticall,
  useLiquidityManagerRemoveLiquidity,
  usePrepareLiquidityManagerMulticall,
  usePrepareLiquidityManagerRemoveLiquidity,
} from "../../../../generated";
import type { HookArg } from "../../../../hooks/useBalance";
import {
  useLendgine,
  useLendginePosition,
} from "../../../../hooks/useLendgine";
import { useIsWrappedNative } from "../../../../hooks/useTokens";
import type { WrappedTokenInfo } from "../../../../hooks/useTokens2";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerPosition,
} from "../../../../utils/Numoen/lendgineMath";
import { priceToFraction } from "../../../../utils/Numoen/price";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../utils/Numoen/trade";
import { useEarnDetails } from "../EarnDetailsInner";

export const useWithdraw = ({
  size,
  liquidity,
  amount0,
  amount1,
}: {
  size: HookArg<CurrencyAmount<Token>>;
  liquidity: HookArg<CurrencyAmount<Token>>;
  amount0: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  amount1: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}) => {
  const { selectedLendgine } = useEarnDetails();
  const settings = useSettings();
  const environment = useEnvironment();
  const { address } = useAccount();

  const liquidityManagerContract = useLiquidityManager({
    address: environment.base.liquidityManager,
  });
  const native0 = useIsWrappedNative(selectedLendgine.token0);
  const native1 = useIsWrappedNative(selectedLendgine.token1);

  const { args, unwrapArgs, sweepArgs } = useMemo(() => {
    if (!size || !address || !amount0 || !amount1 || !liquidity) return {};

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
        size: BigNumber.from(size.quotient.toString()),

        recipient: native0 || native1 ? AddressZero : address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    const unwrapArgs = [BigNumber.from(0), address] as const; // safe to be zero because the collect estimation will fail
    const sweepArgs = [
      native0
        ? selectedLendgine.token1.address
        : selectedLendgine.token0.address,
      BigNumber.from(0),
      address,
    ] as const; // safe to be zero because the collect estimation will fail

    return { args, unwrapArgs, sweepArgs };
  }, [
    address,
    amount0,
    amount1,
    liquidity,
    native0,
    native1,
    selectedLendgine.bound,
    selectedLendgine.token0.address,
    selectedLendgine.token0.decimals,
    selectedLendgine.token1.address,
    selectedLendgine.token1.decimals,
    settings.maxSlippagePercent,
    settings.timeout,
    size,
  ]);

  const prepareRemove = usePrepareLiquidityManagerRemoveLiquidity({
    address: environment.base.liquidityManager,
    args: args,
    enabled: !!args,
    staleTime: Infinity,
  });
  const sendRemove = useLiquidityManagerRemoveLiquidity(prepareRemove.config);

  const prepareMulticall = usePrepareLiquidityManagerMulticall({
    enabled:
      !!prepareRemove.config.request &&
      (native0 || native1) &&
      !!sweepArgs &&
      !!unwrapArgs &&
      !!liquidityManagerContract,
    address: environment.base.liquidityManager,
    staleTime: Infinity,
    args:
      prepareRemove.config.request &&
      prepareRemove.config.request.data &&
      liquidityManagerContract
        ? [
            [
              prepareRemove.config.request.data,
              liquidityManagerContract.interface.encodeFunctionData(
                "unwrapWETH",
                unwrapArgs
              ),
              liquidityManagerContract.interface.encodeFunctionData(
                "sweepToken",
                sweepArgs
              ),
            ] as `0x${string}`[],
          ]
        : undefined,
  });
  const sendMulticall = useLiquidityManagerMulticall(prepareMulticall.config);

  return useMemo(
    () =>
      native0 || native1
        ? [
            {
              stageTitle: `Remove ${selectedLendgine.token0.symbol} / ${selectedLendgine.token1.symbol} liquidty`,
              parallelTransactions: [
                {
                  title: `Remove ${selectedLendgine.token0.symbol} / ${selectedLendgine.token1.symbol} liquidty`,
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
              stageTitle: `Remove ${selectedLendgine.token0.symbol} / ${selectedLendgine.token1.symbol} liquidty`,
              parallelTransactions: [
                {
                  title: `Remove ${selectedLendgine.token0.symbol} / ${selectedLendgine.token1.symbol} liquidty`,
                  tx: {
                    prepare: prepareRemove as ReturnType<
                      typeof usePrepareContractWrite
                    >,
                    send: sendRemove,
                  },
                },
              ],
            },
          ] as const),
    [
      native0,
      native1,
      prepareMulticall,
      prepareRemove,
      selectedLendgine.token0.symbol,
      selectedLendgine.token1.symbol,
      sendMulticall,
      sendRemove,
    ]
  );
};

export const useWithdrawAmounts = ({
  withdrawPercent,
}: {
  withdrawPercent: HookArg<number>;
}) => {
  const { selectedLendgine } = useEarnDetails();
  const { address } = useAccount();
  const position = useLendginePosition(selectedLendgine, address);
  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const t = getT();

  return useMemo(() => {
    if (!position.data || !withdrawPercent || !lendgineInfoQuery.data)
      return {};

    const size = position.data.size.multiply(withdrawPercent).divide(100);
    const updatedLendgineInfo = accruedLendgineInfo(
      selectedLendgine,
      lendgineInfoQuery.data,
      t
    );

    const liqPerPosition = liquidityPerPosition(
      selectedLendgine,
      updatedLendgineInfo
    );
    const liquidity = liqPerPosition.quote(size);

    const amount0 = updatedLendgineInfo.reserve0
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);

    const amount1 = updatedLendgineInfo.reserve1
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);

    return { size, liquidity, amount0, amount1 };
  }, [
    lendgineInfoQuery.data,
    position.data,
    selectedLendgine,
    t,
    withdrawPercent,
  ]);
};
