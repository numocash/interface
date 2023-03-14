import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";

import type { Lendgine, LendgineInfo } from "../../../../../constants/types";
import { formatPercent, formatPrice } from "../../../../../utils/format";
import { borrowRate } from "../../../../../utils/Numoen/jumprate";
import {
  accruedLendgineInfo,
  getT,
} from "../../../../../utils/Numoen/lendgineMath";
import { RowBetween } from "../../../../common/RowBetween";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { VerticalItem } from "../../../../common/VerticalItem";
import { usePositionValue, useTradeDetails } from "../../TradeDetailsInner";

type Props<L extends Lendgine = Lendgine> = {
  balance: CurrencyAmount<Token>;
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
};

export const PositionItem: React.FC<Props> = ({
  lendgine,
  lendgineInfo,
}: Props) => {
  const { base, quote, setSelectedLendgine, setClose, setModalOpen, price } =
    useTradeDetails();
  const symbol = quote.symbol + (lendgine.token1.equals(quote) ? "+" : "-");
  const isInverse = base.equals(lendgine.token1);

  const positionValue = usePositionValue(lendgine);
  const t = getT();

  const funding = useMemo(() => {
    const updatedLendgineInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    return borrowRate(updatedLendgineInfo);
  }, [lendgine, lendgineInfo, t]);

  const value = useMemo(() => {
    if (!positionValue) return undefined;

    return isInverse ? positionValue : price.quote(positionValue);
  }, [isInverse, positionValue, price]);

  return (
    <>
      <div tw="w-full justify-between hidden md:grid grid-cols-9 items-center">
        <p tw="font-semibold pl-4 col-span-2">{symbol}</p>
        <p tw="justify-self-start col-span-2">
          {formatPrice(isInverse ? lendgine.bound.invert() : lendgine.bound)}
        </p>

        {value ? (
          <TokenAmountDisplay
            amount={value}
            showSymbol
            tw="col-span-2 justify-self-start"
          />
        ) : (
          ""
        )}
        <p tw="justify-self-start col-span-2">{formatPercent(funding)}</p>

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
      <div tw="w-full justify-between flex flex-col  md:hidden gap-1">
        <RowBetween tw="items-center p-0 mb-1">
          <p tw="font-semibold rounded-lg px-2 py-1 bg-secondary w-min">
            {symbol}
          </p>
          <VerticalItem
            item={
              value ? (
                <TokenAmountDisplay
                  amount={value}
                  showSymbol
                  tw="col-span-2 justify-self-start"
                />
              ) : (
                ""
              )
            }
            label="Position Value"
          />
        </RowBetween>
        <RowBetween tw="items-center p-0">
          <p tw="text-secondary">Bound</p>
          <p tw="justify-self-start col-span-2">
            {formatPrice(isInverse ? lendgine.bound.invert() : lendgine.bound)}
          </p>
        </RowBetween>

        <RowBetween tw="items-center p-0">
          <p tw="text-secondary">Funding Rate</p>
          <p tw="justify-self-start col-span-2">{formatPercent(funding)}</p>
        </RowBetween>

        <button
          tw="text-button rounded-lg bg-tertiary  h-8 text-xl font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90"
          onClick={() => {
            setClose(true);
            setModalOpen(true);
            setSelectedLendgine(lendgine);
          }}
        >
          Close
        </button>
      </div>
    </>
  );
};
