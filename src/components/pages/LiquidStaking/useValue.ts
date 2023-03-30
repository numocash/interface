import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";

import { useEnvironment } from "../../../contexts/useEnvironment";
import type { HookArg } from "../../../hooks/internal/types";
import {
  isV3,
  useCurrentPrice,
  useMostLiquidMarket,
} from "../../../hooks/useExternalExchange";
import { useLendgine } from "../../../hooks/useLendgine";
import { ONE_HUNDRED_PERCENT } from "../../../lib/constants";
import {
  getT,
  liquidityPerCollateral,
  liquidityPerPosition,
  liquidityPerShare,
} from "../../../lib/lendgineMath";
import { pricePerLiquidity } from "../../../lib/price";
import type { Lendgine, LendginePosition } from "../../../lib/types/lendgine";
import { accruedLendgineInfo } from "./LP/math";

export const useLongValue = (position: HookArg<CurrencyAmount<Token>>) => {
  const environment = useEnvironment();
  const t = getT();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const staking = environment.interface.liquidStaking!;
  const mostLiquidQuery = useMostLiquidMarket([
    staking.lendgine.token0,
    staking.lendgine.token1,
  ] as const);
  const currentPriceQuery = useCurrentPrice([
    staking.lendgine.token0,
    staking.lendgine.token1,
  ] as const);

  const lendgineInfoQuery = useLendgine(staking.lendgine);

  return useMemo(() => {
    if (
      !position ||
      !lendgineInfoQuery.data ||
      !mostLiquidQuery.data ||
      !currentPriceQuery.data
    )
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      staking.lendgine,
      lendgineInfoQuery.data,
      t
    );

    // liq
    const liquidity = liquidityPerShare(
      staking.lendgine,
      updatedLendgineInfo
    ).quote(position);

    // token1
    const collateral = liquidityPerCollateral(staking.lendgine)
      .invert()
      .quote(liquidity);

    const amount0 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve0
          .multiply(liquidity)
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve0.currency, 0);

    const amount1 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve1
          .multiply(liquidity)
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve1.currency, 0);

    const dexFee = isV3(mostLiquidQuery.data.pool)
      ? new Percent(mostLiquidQuery.data.pool.feeTier, "1000000")
      : new Percent("3000", "1000000");

    // token1
    const debtValue = amount1.add(
      currentPriceQuery.data
        .invert()
        .quote(amount0)
        .multiply(ONE_HUNDRED_PERCENT.add(dexFee))
    );

    const value = collateral.subtract(debtValue);

    return { value: currentPriceQuery.data.quote(value) };
  }, [
    currentPriceQuery.data,
    lendgineInfoQuery.data,
    mostLiquidQuery.data,
    position,
    staking.lendgine,
    t,
  ]);
};

export const useLPValue = (
  position: HookArg<Pick<LendginePosition<Lendgine>, "size">>
) => {
  const environment = useEnvironment();
  const t = getT();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const staking = environment.interface.liquidStaking!;

  const currentPriceQuery = useCurrentPrice([
    staking.lendgine.token0,
    staking.lendgine.token1,
  ] as const);

  const lendgineInfoQuery = useLendgine(staking.lendgine);

  return useMemo(() => {
    if (!position || !lendgineInfoQuery.data || !currentPriceQuery.data)
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      staking.lendgine,
      lendgineInfoQuery.data,
      t
    );
    // liq / size
    const liqPerPosition = liquidityPerPosition(
      staking.lendgine,
      updatedLendgineInfo
    );

    // token0 / liq
    const liquidityPrice = pricePerLiquidity({
      lendgine: staking.lendgine,
      lendgineInfo: updatedLendgineInfo,
    });

    // token0
    const value = liqPerPosition.multiply(liquidityPrice).quote(position.size);

    const amount0 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve0
          .multiply(liqPerPosition.quote(position.size))
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve0.currency, 0);

    const amount1 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve1
          .multiply(liqPerPosition.quote(position.size))
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve1.currency, 0);

    return {
      amount0,
      amount1,
      value: value,
    };
  }, [
    currentPriceQuery.data,
    lendgineInfoQuery.data,
    position,
    staking.lendgine,
    t,
  ]);
};
