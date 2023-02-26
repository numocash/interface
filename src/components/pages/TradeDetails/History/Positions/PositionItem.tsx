import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";

import type { Lendgine, LendgineInfo } from "../../../../../constants/types";
import { formatPrice } from "../../../../../utils/format";
import {
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../../utils/Numoen/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerLiquidity,
} from "../../../../../utils/Numoen/price";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useTradeDetails } from "../../TradeDetailsInner";

type Props<L extends Lendgine = Lendgine> = {
  balance: CurrencyAmount<Token>;
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
};

export const PositionItem: React.FC<Props> = ({
  balance,
  lendgine,
  lendgineInfo,
}: Props) => {
  const { base, quote, setSelectedLendgine, setClose, setModalOpen } =
    useTradeDetails();
  const symbol = quote.symbol + (lendgine.token1.equals(quote) ? "+" : "-");
  const isInverse = base.equals(lendgine.token1);

  const value = useMemo(() => {
    // token0 / token1
    const price = numoenPrice(lendgine, lendgineInfo);

    // token0 / liq
    const liquidityPrice = pricePerLiquidity({ lendgine, price });

    // liq / share
    const liqPerShare = liquidityPerShare(lendgine, lendgineInfo);

    // liq
    const liquidity = liqPerShare.quote(balance);

    // token0
    const liquidityDebt = liquidityPrice.quote(liquidity);

    // liq / token1
    const liqPerCol = liquidityPerCollateral(lendgine);

    // token0
    const collateralValue = price.quote(liqPerCol.invert().quote(liquidity));

    // token0
    const value = collateralValue.subtract(liquidityDebt);

    return isInverse ? invert(price).quote(value) : value;
  }, [balance, isInverse, lendgine, lendgineInfo]);
  return (
    <div
      tw="w-full justify-between  grid grid-cols-9  h-12 items-center"
      key={balance.currency.address}
    >
      <p tw="font-semibold pl-4 col-span-2">{symbol}</p>
      <p tw="justify-self-start col-span-2">
        {formatPrice(isInverse ? lendgine.bound.invert() : lendgine.bound)}
      </p>

      <TokenAmountDisplay
        amount={value}
        showSymbol
        tw="col-span-2 justify-self-start"
      />
      <p tw="justify-self-start col-span-2">N/A</p>

      <button
        tw="text-tertiary text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90 hidden xl:flex"
        onClick={() => {
          setClose(true);
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </button>
      <button
        tw="text-tertiary text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90 xl:hidden"
        onClick={() => {
          setClose(true);
          setModalOpen(true);
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </button>
    </div>
  );
};
