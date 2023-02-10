import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";

import type { Lendgine } from "../../../../../constants";
import type { LendgineInfo } from "../../../../../hooks/useLendgine";
import {
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
  convertShareToLiquidity,
} from "../../../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../../../utils/Numoen/price";
import { scale } from "../../../../../utils/Numoen/trade";
import { useTradeDetails } from "../..";

interface Props {
  balance: CurrencyAmount<Token>;
  lendgine: Lendgine;
  lendgineInfo: LendgineInfo;
}

export const PositionItem: React.FC<Props> = ({
  balance,
  lendgine,
  lendgineInfo,
}: Props) => {
  const { base, quote } = useTradeDetails();
  const symbol = quote.symbol + (lendgine.token1.equals(quote) ? "+" : "-");

  const value = useMemo(() => {
    const price = numoenPrice(lendgine, lendgineInfo);
    const liquidity = convertShareToLiquidity(balance, lendgineInfo);
    const collateral = convertLiquidityToCollateral(liquidity, lendgine);

    const liquidityPrice = convertPriceToLiquidityPrice(price, lendgine);
    console.log(liquidityPrice.toSignificant(6));

    const liquidityValue = liquidity.multiply(liquidityPrice).divide(scale);
    const collateralValue = collateral.multiply(price).divide(scale);

    const value = collateralValue.subtract(liquidityValue);

    return value;
  }, [balance, lendgine, lendgineInfo]);
  return (
    <div
      tw="w-full justify-between  grid grid-cols-9  h-12 items-center"
      key={balance.currency.address}
    >
      <p tw="font-semibold pl-4 col-span-2">{symbol}</p>
      <p tw="justify-self-start col-span-2">
        {lendgine.bound.asFraction.toSignificant(5)}
      </p>

      <p tw="justify-self-start col-span-2">
        {value.toSignificant(4)} {base.symbol}
      </p>
      <p tw="justify-self-start col-span-2">N/A</p>

      <button tw="text-red text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90 ">
        Close
      </button>
    </div>
  );
};
