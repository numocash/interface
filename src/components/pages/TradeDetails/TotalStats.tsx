import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { useLendgines } from "../../../hooks/useLendgines";
import { liquidityPerCollateral } from "../../../lib/lendgineMath";
import { invert, numoenPrice, pricePerLiquidity } from "../../../lib/price";
import { AddressLink } from "../../../utils/beet";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { useTradeDetails } from "./TradeDetailsInner";

export const TotalStats: React.FC = () => {
  const { base, quote, lendgines } = useTradeDetails();

  const lendgineInfosQuery = useLendgines(lendgines);

  const { openInterest, tvl } = useMemo(() => {
    if (lendgineInfosQuery.isLoading || !lendgineInfosQuery.data) return {};

    const openInterest = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);

      // token0 / liq
      const liquidityPrice = pricePerLiquidity({ lendgine, price });

      const liquidity = cur.totalLiquidityBorrowed;

      // token0
      const liquidityValue = liquidityPrice.quote(liquidity);

      return (
        lendgine.token0.equals(base)
          ? liquidityValue
          : invert(price).quote(liquidityValue)
      ).add(acc);
    }, CurrencyAmount.fromRawAmount(base, 0));

    const tvl = lendgineInfosQuery.data.reduce((acc, cur, i) => {
      const lendgine = lendgines[i];
      invariant(lendgine);
      // token0 / token1
      const price = numoenPrice(lendgine, cur);
      // liq / token1
      const liqPerCol = liquidityPerCollateral(lendgine);

      // token0 / liq
      const liquidityPrice = pricePerLiquidity({ lendgine, price });

      // token1
      const collateral = liqPerCol.invert().quote(cur.totalLiquidityBorrowed);

      const liquidity = cur.totalLiquidity.add(cur.totalLiquidityBorrowed);

      // token0
      const liquidityValue = liquidityPrice.quote(liquidity);
      const collateralValue = price.quote(collateral);
      return (
        lendgine.token0.equals(base)
          ? liquidityValue.add(collateralValue)
          : invert(price).quote(liquidityValue.add(collateralValue))
      ).add(acc);
    }, CurrencyAmount.fromRawAmount(base, 0));

    return { openInterest, tvl };
  }, [base, lendgineInfosQuery.data, lendgineInfosQuery.isLoading, lendgines]);

  return (
    <div tw="w-full flex flex-col items-center gap-4 bg-white border rounded border-gray-200 p-6 shadow h-min">
      <div tw="w-full grid md:grid-cols-2 gap-4">
        <div tw="flex flex-col gap-1">
          {!openInterest ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-8 w-20" />
          ) : (
            <TokenAmountDisplay
              amount={openInterest}
              showSymbol
              tw="text-xl font-bold"
            />
          )}
          <p tw="text-secondary">Open interest</p>
        </div>
        <div tw="flex flex-col gap-1">
          {!openInterest ? (
            <div tw="rounded-lg transform ease-in-out duration-300 animate-pulse bg-gray-100 h-8 w-20" />
          ) : (
            <TokenAmountDisplay
              amount={tvl}
              showSymbol
              tw="text-xl font-bold"
            />
          )}
          <p tw="text-secondary">Total value locked</p>
        </div>
      </div>
      <div tw="w-full border-b border-gray-200" />
      <RowBetween tw="items-center p-0 pt-4">
        <p tw=" text-secondary">Base token</p>
        <AddressLink
          data="address"
          address={utils.getAddress(base.address)}
          tw=" underline"
        />
      </RowBetween>
      <RowBetween tw="items-center p-0">
        <p tw=" text-secondary">Quote token</p>
        <AddressLink
          data="address"
          address={utils.getAddress(quote.address)}
          tw=" underline"
        />
      </RowBetween>
      <RowBetween tw="items-start p-0">
        <p tw=" text-secondary">Lendgines</p>

        <div tw="flex flex-col gap-4 text-right">
          {lendgines?.map((l) => (
            <AddressLink
              data="address"
              key={l.address}
              address={l.address}
              tw=" underline"
            />
          ))}
        </div>
      </RowBetween>
    </div>
  );
};
