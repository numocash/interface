import { useMemo } from "react";
import { useAccount } from "wagmi";

import type { HookArg } from "./internal/types";
import { useBalance } from "./useBalance";
import { useMostLiquidMarket } from "./useExternalExchange";
import { useLendgine } from "./useLendgine";
import { useLendginePosition } from "./useLendginePosition";
import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/useEnvironment";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
  calculateEstimatedTokensOwed,
  calculateEstimatedWithdrawAmount,
} from "../lib/amounts";
import { lendgineToMarket } from "../lib/lendgineValidity";
import { invert } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";

export const useValue = <L extends Lendgine>(
  lendgine: HookArg<L>,
  protocol: Protocol
) => {
  const { address } = useAccount();
  const environment = useEnvironment();

  const balanceQuery = useBalance(lendgine?.lendgine, address);
  const lendgineInfoQuery = useLendgine(lendgine);

  const market = useMemo(
    () =>
      lendgine
        ? lendgineToMarket(
            lendgine,
            environment.interface.wrappedNative,
            environment.interface.specialtyMarkets
          )
        : undefined,
    [
      environment.interface.specialtyMarkets,
      environment.interface.wrappedNative,
      lendgine,
    ]
  );
  const currentPriceQuery = useMostLiquidMarket(market);

  return useMemo(() => {
    if (
      balanceQuery.isLoading ||
      lendgineInfoQuery.isLoading ||
      currentPriceQuery.status === "loading"
    )
      return { status: "loading" } as const;

    if (
      !lendgine ||
      !lendgineInfoQuery.data ||
      !currentPriceQuery.data ||
      !balanceQuery.data ||
      !market
    )
      return { status: "error" } as const;

    const { collateral, liquidity } = calculateEstimatedBurnAmount(
      lendgine,
      lendgineInfoQuery.data,
      balanceQuery.data,
      protocol
    );
    const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
      lendgine,
      lendgineInfoQuery.data,
      liquidity
    );

    const price = lendgine.token0.equals(market.quote)
      ? currentPriceQuery.data.price
      : invert(currentPriceQuery.data.price);

    const value = price
      .quote(collateral)
      .subtract(amount0.add(price.quote(amount1)));

    return { status: "success", value } as const;
  }, [
    balanceQuery.data,
    balanceQuery.isLoading,
    currentPriceQuery.data,
    currentPriceQuery.status,
    lendgine,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    market,
    protocol,
  ]);
};

export const useTotalValue = <L extends Lendgine>(
  lendgine: HookArg<L>,
  protocol: Protocol
) => {
  const environment = useEnvironment();

  const lendgineInfoQuery = useLendgine(lendgine);

  const market = useMemo(
    () =>
      lendgine
        ? lendgineToMarket(
            lendgine,
            environment.interface.wrappedNative,
            environment.interface.specialtyMarkets
          )
        : undefined,
    [
      environment.interface.specialtyMarkets,
      environment.interface.wrappedNative,
      lendgine,
    ]
  );
  const currentPriceQuery = useMostLiquidMarket(market);

  return useMemo(() => {
    if (lendgineInfoQuery.isLoading || currentPriceQuery.status === "loading")
      return { status: "loading" } as const;

    if (
      !lendgine ||
      !lendgineInfoQuery.data ||
      !currentPriceQuery.data ||
      !market
    )
      return { status: "error" } as const;

    const { collateral, liquidity } = calculateEstimatedBurnAmount(
      lendgine,
      lendgineInfoQuery.data,
      lendgineInfoQuery.data.totalSupply,
      protocol
    );
    const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
      lendgine,
      lendgineInfoQuery.data,
      liquidity
    );

    const price = lendgine.token0.equals(market.quote)
      ? currentPriceQuery.data.price
      : invert(currentPriceQuery.data.price);

    const value = price
      .quote(collateral)
      .subtract(amount0.add(price.quote(amount1)));

    return { status: "success", value } as const;
  }, [
    currentPriceQuery.data,
    currentPriceQuery.status,
    lendgine,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    market,
    protocol,
  ]);
};

export const usePositionValue = <L extends Lendgine>(
  lendgine: HookArg<L>,
  protocol: Protocol
) => {
  const { address } = useAccount();

  const positionQuery = useLendginePosition(lendgine, address, protocol);
  const lendgineInfoQuery = useLendgine(lendgine);

  const priceQuery = useMostLiquidMarket(
    lendgine ? { quote: lendgine.token0, base: lendgine.token1 } : undefined
  );

  return useMemo(() => {
    if (
      positionQuery.isLoading ||
      lendgineInfoQuery.isLoading ||
      priceQuery.status === "loading"
    )
      return { status: "loading" } as const;

    if (
      !lendgine ||
      !lendgineInfoQuery.data ||
      !priceQuery.data ||
      !positionQuery.data
    )
      return { status: "error" } as const;

    const { liquidity } = calculateEstimatedWithdrawAmount(
      lendgine,
      lendgineInfoQuery.data,
      positionQuery.data,
      protocol
    );
    const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
      lendgine,
      lendgineInfoQuery.data,
      liquidity
    );
    const tokensOwed = calculateEstimatedTokensOwed(
      lendgine,
      lendgineInfoQuery.data,
      positionQuery.data,
      protocol
    );

    const value = amount0.add(
      priceQuery.data.price.quote(amount1.add(tokensOwed))
    );

    return { status: "success", value } as const;
  }, [
    lendgine,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    positionQuery.data,
    positionQuery.isLoading,
    priceQuery.data,
    priceQuery.status,
    protocol,
  ]);
};
