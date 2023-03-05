import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLiquidityManagerRemoveLiquidity,
  usePrepareLiquidityManagerRemoveLiquidity,
} from "../../../../generated";
import type { HookArg } from "../../../../hooks/useBalance";
import {
  useLendgine,
  useLendginePosition,
} from "../../../../hooks/useLendgine";
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

  const { args } = useMemo(() => {
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

        recipient: address,
        deadline: BigNumber.from(
          Math.round(Date.now() / 1000) + settings.timeout * 60
        ),
      },
    ] as const;

    return { amount0, amount1, liquidity, args };
  }, [
    address,
    amount0,
    amount1,
    liquidity,
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

  return useMemo(
    () =>
      [
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
      ] as const,
    [
      prepareRemove,
      selectedLendgine.token0.symbol,
      selectedLendgine.token1.symbol,
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
      .divide(updatedLendgineInfo.totalLiquidity)
      .divide(100);

    const amount1 = updatedLendgineInfo.reserve1
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity)
      .divide(100);

    return { size, liquidity, amount0, amount1 };
  }, [
    lendgineInfoQuery.data,
    position.data,
    selectedLendgine,
    t,
    withdrawPercent,
  ]);
};
