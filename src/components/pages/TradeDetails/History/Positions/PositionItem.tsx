import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";

import type { Lendgine } from "../../../../../constants";
import type { LendgineInfo } from "../../../../../hooks/useLendgine";
import { numoenPrice, pricePerShare } from "../../../../../utils/Numoen/price";
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
  const { base, quote, setSelectedLendgine, setClose } = useTradeDetails();
  const symbol = quote.symbol + (lendgine.token1.equals(quote) ? "+" : "-");
  const isInverse = base.equals(lendgine.token1);

  const value = useMemo(() => {
    const sharePrice = pricePerShare(lendgine, lendgineInfo);
    // token0 / token1
    const price = numoenPrice(lendgine, lendgineInfo);

    // token0
    const value = sharePrice.multiply(balance).divide(scale);

    return isInverse ? value.divide(price) : value;
  }, [balance, isInverse, lendgine, lendgineInfo]);
  return (
    <div
      tw="w-full justify-between  grid grid-cols-9  h-12 items-center"
      key={balance.currency.address}
    >
      <p tw="font-semibold pl-4 col-span-2">{symbol}</p>
      <p tw="justify-self-start col-span-2">
        {(isInverse
          ? lendgine.bound.asFraction.invert()
          : lendgine.bound.asFraction
        ).toSignificant(5)}
      </p>

      <p tw="justify-self-start col-span-2">
        {value.toSignificant(4)} {base.symbol}
      </p>
      <p tw="justify-self-start col-span-2">N/A</p>

      <button
        tw="text-red text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90"
        onClick={() => {
          setClose(true);
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </button>
    </div>
  );
};
