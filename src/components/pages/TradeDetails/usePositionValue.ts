import { Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { useTradeDetails } from "./TradeDetailsInner";
import { useBalance } from "../../../hooks/useBalance";
import { isV3, useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { useLendgine } from "../../../hooks/useLendgine";
import { ONE_HUNDRED_PERCENT } from "../../../lib/constants";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../lib/lendgineMath";
import { isShortLendgine } from "../../../lib/lendgines";
import type { Lendgine } from "../../../lib/types/lendgine";

export const usePositionValue = (lendgine: Lendgine) => {
  const { address } = useAccount();
  const { price: referencePrice, base, quote } = useTradeDetails();
  const t = getT();
  const mostLiquidQuery = useMostLiquidMarket({ base, quote });

  const balanceQuery = useBalance(lendgine.lendgine, address);
  const lendgineInfoQuery = useLendgine(lendgine);

  const { value } = useMemo(() => {
    if (!balanceQuery.data || !lendgineInfoQuery.data || !mostLiquidQuery.data)
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      lendgine,
      lendgineInfoQuery.data,
      t
    );

    // liq
    const liquidity = liquidityPerShare(lendgine, updatedLendgineInfo).quote(
      balanceQuery.data
    );

    // token1
    const collateral = liquidityPerCollateral(lendgine)
      .invert()
      .quote(liquidity);

    const token0Amount = updatedLendgineInfo.reserve0
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);
    const token1Amount = updatedLendgineInfo.reserve1
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);

    // token0 / token1
    const referencePriceAdjusted = isShortLendgine(lendgine, base)
      ? referencePrice.invert()
      : referencePrice;

    const dexFee = isV3(mostLiquidQuery.data.pool)
      ? new Percent(mostLiquidQuery.data.pool.feeTier, "1000000")
      : new Percent("3000", "1000000");

    // token1
    const debtValue = token1Amount.add(
      referencePriceAdjusted
        .invert()
        .quote(token0Amount)
        .multiply(ONE_HUNDRED_PERCENT.add(dexFee))
    );

    const value = collateral.subtract(debtValue);

    return { value };
  }, [
    balanceQuery.data,
    base,
    lendgine,
    lendgineInfoQuery.data,
    mostLiquidQuery.data,
    referencePrice,
    t,
  ]);

  return value;
};
