import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useSettings } from "../../../../../contexts/settings";
import { useEnvironment } from "../../../../../contexts/useEnvironment";
import {
  useLiquidityManager,
  useLiquidityManagerAddLiquidity,
  useLiquidityManagerMulticall,
  usePrepareLiquidityManagerAddLiquidity,
  usePrepareLiquidityManagerMulticall,
} from "../../../../../generated";
import type { HookArg } from "../../../../../hooks/internal/utils";
import { useApprove } from "../../../../../hooks/useApprove";
import { useLendgine } from "../../../../../hooks/useLendgine";
import { useIsWrappedNative } from "../../../../../hooks/useTokens";
import type { WrappedTokenInfo } from "../../../../../hooks/useTokens2";
import type { BeetStage } from "../../../../../utils/beet";
import { isLongLendgine } from "../../../../../utils/lendgines";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerPosition,
} from "../../../../../utils/Numoen/lendgineMath";
import {
  invert,
  priceToFraction,
  priceToReserves,
} from "../../../../../utils/Numoen/price";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../../utils/Numoen/trade";
import { useEarnDetails } from "../EarnDetailsInner";

export const useDeposit = ({
  token0Input,
  token1Input,
}: {
  token0Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  token1Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
}): BeetStage[] => {
  const { price, selectedLendgine: lendgine, base } = useEarnDetails();
  const t = getT();

  const environment = useEnvironment();
  const settings = useSettings();
  const { address } = useAccount();

  const liquidityManagerContract = useLiquidityManager({
    address: environment.base.liquidityManager,
  });
  const native0 = useIsWrappedNative(lendgine.token0);
  const native1 = useIsWrappedNative(lendgine.token1);

  const approveToken0 = useApprove(
    token0Input,
    environment.base.liquidityManager
  );
  const approveToken1 = useApprove(
    token1Input,
    environment.base.liquidityManager
  );
  const lendgineInfo = useLendgine(lendgine);

  const { args } = useMemo(() => {
    if (!token0Input || !token1Input || !lendgineInfo.data || !address)
      return {};

    if (lendgineInfo.data.totalLiquidity.equalTo(0)) {
      const isLong = isLongLendgine(lendgine, base);

      const { token0Amount } = priceToReserves(
        lendgine,
        isLong ? price : invert(price)
      );

      const liquidity = token0Amount.invert().quote(token0Input);

      const args = [
        {
          token0: getAddress(lendgine.token0.address),
          token1: getAddress(lendgine.token1.address),
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

      return { args };
    }

    // determine percentage of pool
    const updatedInfo = accruedLendgineInfo(lendgine, lendgineInfo.data, t);
    const share = token0Input.divide(updatedInfo.reserve0);
    const liquidity = updatedInfo.totalLiquidity.multiply(share);
    const liqPerPosition = liquidityPerPosition(lendgine, updatedInfo);
    const positionSize = liqPerPosition.invert().quote(liquidity);

    const args = [
      {
        token0: getAddress(lendgine.token0.address),
        token1: getAddress(lendgine.token1.address),
        token0Exp: BigNumber.from(lendgine.token0.decimals),
        token1Exp: BigNumber.from(lendgine.token1.decimals),
        upperBound: BigNumber.from(
          priceToFraction(lendgine.bound).multiply(scale).quotient.toString()
        ),
        liquidity: BigNumber.from(
          liquidity.multiply(999990).divide(1000000).quotient.toString()
        ),
        amount0Min: BigNumber.from(
          token0Input
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        amount1Min: BigNumber.from(
          token1Input
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        sizeMin: BigNumber.from(
          positionSize
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        recipient: address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    return { args };
  }, [
    address,
    base,
    lendgine,
    lendgineInfo.data,
    price,
    settings.maxSlippagePercent,
    settings.timeout,
    t,
    token0Input,
    token1Input,
  ]);

  const prepareAdd = usePrepareLiquidityManagerAddLiquidity({
    address: environment.base.liquidityManager,
    args: args,
    enabled: !!args,
    staleTime: Infinity,
  });
  const sendAdd = useLiquidityManagerAddLiquidity(prepareAdd.config);

  const prepareMulticall = usePrepareLiquidityManagerMulticall({
    address: environment.base.liquidityManager,
    enabled: !!args && (native0 || native1) && !!liquidityManagerContract,
    staleTime: Infinity,
    args:
      !!args && !!liquidityManagerContract
        ? [
            [
              liquidityManagerContract.interface.encodeFunctionData(
                "addLiquidity",
                args
              ),
              liquidityManagerContract.interface.encodeFunctionData(
                "refundETH"
              ),
            ] as `0x${string}`[],
          ]
        : undefined,
    overrides: {
      value: native0
        ? BigNumber.from(token0Input?.quotient.toString() ?? 0)
        : BigNumber.from(token1Input?.quotient.toString() ?? 0),
    },
  });
  const sendMulticall = useLiquidityManagerMulticall(prepareMulticall.config);

  return useMemo(
    () =>
      (
        [
          native0 ? undefined : approveToken0.beetStage,
          native1 ? undefined : approveToken1.beetStage,
          native0 || native1
            ? {
                stageTitle: `Add ${token0Input?.currency.symbol ?? ""} / ${
                  token1Input?.currency.symbol ?? ""
                } liquidty`,
                parallelTransactions: [
                  {
                    title: `Add ${token0Input?.currency.symbol ?? ""} / ${
                      token1Input?.currency.symbol ?? ""
                    } liquidty`,
                    tx: {
                      prepare: prepareMulticall as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendMulticall,
                    },
                  },
                ],
              }
            : {
                stageTitle: `Add ${token0Input?.currency.symbol ?? ""} / ${
                  token1Input?.currency.symbol ?? ""
                } liquidty`,
                parallelTransactions: [
                  {
                    title: `Add ${token0Input?.currency.symbol ?? ""} / ${
                      token1Input?.currency.symbol ?? ""
                    } liquidty`,
                    tx: {
                      prepare: prepareAdd as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendAdd,
                    },
                  },
                ],
              },
        ] as const
      ).filter((s): s is BeetStage => !!s),
    [
      approveToken0.beetStage,
      approveToken1.beetStage,
      native0,
      native1,
      prepareAdd,
      prepareMulticall,
      sendAdd,
      sendMulticall,
      token0Input?.currency.symbol,
      token1Input?.currency.symbol,
    ]
  );
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
