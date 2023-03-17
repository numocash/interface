import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import type { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { Token } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useSettings } from "../../../contexts/settings";
import { useEnvironment } from "../../../contexts/useEnvironment";
import {
  useFactoryCreateLendgine,
  useLiquidityManager,
  useLiquidityManagerAddLiquidity,
  useLiquidityManagerMulticall,
  usePrepareFactoryCreateLendgine,
  usePrepareLiquidityManagerAddLiquidity,
  usePrepareLiquidityManagerMulticall,
} from "../../../generated";
import type { HookArg } from "../../../hooks/internal/utils";
import { useApprove } from "../../../hooks/useApprove";
import { useChain } from "../../../hooks/useChain";
import { useCurrentPrice } from "../../../hooks/useExternalExchange";
import { useIsWrappedNative } from "../../../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../../../lib/constants";
import {
  fractionToPrice,
  priceToFraction,
  priceToReserves,
} from "../../../lib/price";
import type { Lendgine } from "../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import type { BeetStage } from "../../../utils/beet";

export const useCreate = ({
  token0Input,
  token1Input,
  bound,
}: {
  token0Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  token1Input: HookArg<CurrencyAmount<WrappedTokenInfo>>;
  bound: HookArg<Fraction>;
}): BeetStage[] => {
  const environment = useEnvironment();
  const settings = useSettings();
  const { address } = useAccount();
  const chainID = useChain();

  const priceQuery = useCurrentPrice(
    !!token0Input && !!token1Input
      ? ([token0Input.currency, token1Input.currency] as const)
      : null
  );

  const liquidityManagerContract = useLiquidityManager({
    address: environment.base.liquidityManager,
  });
  const native0 = useIsWrappedNative(token0Input?.currency);
  const native1 = useIsWrappedNative(token1Input?.currency);

  const approveToken0 = useApprove(
    token0Input,
    environment.base.liquidityManager
  );
  const approveToken1 = useApprove(
    token1Input,
    environment.base.liquidityManager
  );

  const { args, createArgs } = useMemo(() => {
    if (!token0Input || !token1Input || !address || !priceQuery.data || !bound)
      return {};

    const lendgine: Lendgine = {
      token0: token0Input.currency,
      token0Exp: token0Input.currency.decimals,
      token1: token1Input.currency,
      token1Exp: token1Input.currency.decimals,
      lendgine: new Token(chainID, AddressZero, 18),
      address: AddressZero,
      bound: fractionToPrice(bound, token1Input.currency, token0Input.currency),
    };

    const { token0Amount } = priceToReserves(lendgine, priceQuery.data);

    const liquidity = token0Amount.invert().quote(token0Input);

    const createArgs = [
      getAddress(lendgine.token0.address),
      getAddress(lendgine.token1.address),
      lendgine.token0.decimals,
      lendgine.token1.decimals,
      BigNumber.from(bound.multiply(scale).quotient.toString()),
    ] as const;

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
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        recipient: address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    return { args, createArgs };
  }, [
    address,
    bound,
    chainID,
    priceQuery.data,
    settings.maxSlippagePercent,
    settings.timeout,
    token0Input,
    token1Input,
  ]);

  const prepare = usePrepareFactoryCreateLendgine({
    args: createArgs,
    address: environment.base.factory,
    enabled: !!createArgs,
  });
  const write = useFactoryCreateLendgine(prepare.data);

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
          {
            stageTitle: `New ${token1Input?.currency.symbol ?? ""} + ${
              token0Input?.currency.symbol ?? ""
            } market`,
            parallelTransactions: [
              {
                title: `New ${token1Input?.currency.symbol ?? ""} + ${
                  token0Input?.currency.symbol ?? ""
                } market`,
                tx: {
                  prepare: prepare as ReturnType<
                    typeof usePrepareContractWrite
                  >,
                  send: write,
                },
              },
            ],
          },
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
      prepare,
      prepareAdd,
      prepareMulticall,
      sendAdd,
      sendMulticall,
      token0Input?.currency.symbol,
      token1Input?.currency.symbol,
      write,
    ]
  );
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

  const priceQuery = useCurrentPrice(
    !!token0 && !!token1 ? ([token0, token1] as const) : null
  );
  return useMemo(() => {
    if (!amount || !token0 || !token1 || !bound) return {};
    if (!priceQuery.data)
      return {
        token0Input: amount.currency.equals(token0) ? amount : undefined,
        token1Input: amount.currency.equals(token1) ? amount : undefined,
      };

    if (priceQuery.data.greaterThan(bound))
      return {
        token0Input: amount.currency.equals(token0) ? amount : undefined,
        token1Input: amount.currency.equals(token1) ? amount : undefined,
      };

    const lendgine: Lendgine = {
      token0,
      token0Exp: token0.decimals,
      token1,
      token1Exp: token1.decimals,
      lendgine: new Token(chainID, AddressZero, 18),
      address: AddressZero,
      bound: fractionToPrice(bound, token1, token0),
    };

    const { token0Amount, token1Amount } = priceToReserves(
      lendgine,
      priceQuery.data
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
