import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { css } from "twin.macro";

import type { Protocol } from "../../../constants";
import { useMostLiquidMarket } from "../../../hooks/useExternalExchange";

import { useLendgines } from "../../../hooks/useLendgines";
import {
  calculateAccrual,
  calculateEstimatedPairBurnAmount,
  calculateEstimatedWithdrawAmount,
} from "../../../lib/amounts";
import { calculateSupplyRate } from "../../../lib/jumprate";

import type { Lendgine } from "../../../lib/types/lendgine";
import { formatPercent } from "../../../utils/format";
import { LoadingBox } from "../../common/LoadingBox";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { TokenIcon } from "../../common/TokenIcon";

interface Props {
  lendgines: readonly Lendgine[];
  protocol: Protocol;
}

export const ProvideLiquidity: React.FC<Props> = ({
  lendgines,
  protocol,
}: Props) => {
  const token0 = lendgines[0]!.token0;
  const token1 = lendgines[0]!.token1;

  const lendginesQuery = useLendgines(lendgines);
  const priceQuery = useMostLiquidMarket({
    quote: token0,
    base: token1,
  });

  const tvl = useMemo(() => {
    if (!priceQuery.data || !lendginesQuery.data) return undefined;
    return lendgines.reduce((acc, cur, i) => {
      const { liquidity } = calculateEstimatedWithdrawAmount(
        cur,
        lendginesQuery.data![i]!,
        { size: lendginesQuery.data![i]!.totalPositionSize },
        protocol
      );
      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        liquidity
      );
      const value = amount0.add(priceQuery.data.price.quote(amount1));

      return acc.add(value);
    }, CurrencyAmount.fromRawAmount(token0, 0));
  }, [lendgines, lendginesQuery.data, priceQuery.data, protocol, token0]);

  const bestAPR = useMemo(() => {
    if (!lendginesQuery.data) return undefined;

    return lendgines.reduce((acc, cur, i) => {
      const accruedInfo = calculateAccrual(
        cur,
        lendginesQuery.data![i]!,
        protocol
      );
      const supplyRate = calculateSupplyRate({
        lendgineInfo: accruedInfo,
        protocol,
      });
      // TODO: compute the interest premium
      return supplyRate.greaterThan(acc) ? supplyRate : acc;
    }, new Percent(0));
  }, [lendgines, lendginesQuery.data, protocol]);

  return (
    <div tw="border shadow rounded-xl w-full flex flex-col overflow-clip bg-white">
      <div
        tw="w-full h-24 p-2"
        css={css`
          background-image: linear-gradient(
            to top right,
            ${token0.color?.muted ?? "#dfdfdf"},
            ${token1.color?.vibrant ?? "#dfdfdf"}
          );
        `}
      >
        <p tw="p-2 rounded-lg bg-white w-fit bg-opacity-50">
          Provide liquidity
        </p>
      </div>
      <div tw="flex items-center relative top-[-32px] left-[8px] rounded-lg bg-white w-fit p-2">
        <TokenIcon token={token0} size={48} />
        <TokenIcon token={token1} size={48} />
      </div>

      <div tw="p-4 flex flex-col gap-4  -mt-8">
        <p tw="font-bold text-2xl">
          {token0.symbol} + {token1.symbol}
        </p>
        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">Max APR</p>
          <p tw="text-default font-bold text-2xl">
            {bestAPR ? formatPercent(bestAPR) : <LoadingBox />}
          </p>
        </div>
        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">TVL</p>
          <p tw="text-default font-semibold text-lg">
            {tvl ? <TokenAmountDisplay amount={tvl} /> : <LoadingBox />}
          </p>
        </div>
      </div>
    </div>
  );
};
