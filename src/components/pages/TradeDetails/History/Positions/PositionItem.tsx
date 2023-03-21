import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";

import { borrowRate } from "../../../../../lib/jumprate";
import { accruedLendgineInfo, getT } from "../../../../../lib/lendgineMath";
import { numoenPrice } from "../../../../../lib/price";
import type { Lendgine, LendgineInfo } from "../../../../../lib/types/lendgine";
import { formatPercent } from "../../../../../utils/format";
import { Button } from "../../../../common/Button";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
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
  const { base, quote, setSelectedLendgine, setClose, setModalOpen } =
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
    // token0 / token1
    const price = numoenPrice(lendgine, lendgineInfo);

    return isInverse ? positionValue : price.quote(positionValue);
  }, [isInverse, lendgine, lendgineInfo, positionValue]);

  return (
    <div tw="w-full justify-between hidden md:grid grid-cols-6 items-center py-3">
      <p tw="font-semibold pl-4 col-span-1">{symbol}</p>

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

      <Button
        variant="danger"
        tw=" text-lg font-semibold"
        onClick={() => {
          setClose(true);
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </Button>
    </div>
  );
};
