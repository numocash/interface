import type { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { Token } from "@uniswap/sdk-core";
import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  getContract,
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";

import { factoryABI } from "../../../abis/factory";
import { liquidityManagerABI } from "../../../abis/liquidityManager";
import { useSettings } from "../../../contexts/settings";
import { useEnvironment } from "../../../contexts/useEnvironment";
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
}) => {
  const environment = useEnvironment();
  const settings = useSettings();
  const { address } = useAccount();
  const chainID = useChain();

  const priceQuery = useCurrentPrice(
    !!token0Input && !!token1Input
      ? ([token0Input.currency, token1Input.currency] as const)
      : null
  );

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

  return useMemo(() => {
    if (!token0Input || !token1Input || !address || !priceQuery.data || !bound)
      return undefined;

    const lendgine: Lendgine = {
      token0: token0Input.currency,
      token0Exp: token0Input.currency.decimals,
      token1: token1Input.currency,
      token1Exp: token1Input.currency.decimals,
      lendgine: new Token(chainID, constants.AddressZero, 18),
      address: constants.AddressZero,
      bound: fractionToPrice(bound, token1Input.currency, token0Input.currency),
    };

    const { token0Amount } = priceToReserves(lendgine, priceQuery.data);

    const liquidity = token0Amount.invert().quote(token0Input);

    const createArgs = [
      utils.getAddress(lendgine.token0.address),
      utils.getAddress(lendgine.token1.address),
      lendgine.token0.decimals,
      lendgine.token1.decimals,
      BigNumber.from(bound.multiply(scale).quotient.toString()),
    ] as const;

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
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString()
        ),
        recipient: address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

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

    const createTX = async () => {
      const config = await prepareWriteContract({
        abi: factoryABI,
        functionName: "createLendgine",
        address: environment.base.factory,
        args: createArgs,
      });
      const data = await writeContract(config);
      return data;
    };

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

    return [
      native0 ? undefined : approveToken0.beetStage,
      native1 ? undefined : approveToken1.beetStage,
      {
        stageTitle: createTitle,
        parallelTransactions: [
          {
            title: createTitle,
            tx: createTX,
          },
        ],
      },
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
    approveToken0.beetStage,
    approveToken1.beetStage,
    bound,
    chainID,
    environment.base.factory,
    environment.base.liquidityManager,
    native0,
    native1,
    priceQuery.data,
    settings.maxSlippagePercent,
    settings.timeout,
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

    if (priceToFraction(priceQuery.data).greaterThan(bound))
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
