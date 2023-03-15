import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useAccount } from "wagmi";

import { useBalance } from "../../../../hooks/useBalance";
import { useBeet } from "../../../../utils/beet";
import { isShortLendgine } from "../../../../utils/lendgines";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { RowBetween } from "../../../common/RowBetween";
import { TokenAmountDisplay } from "../../../common/TokenAmountDisplay";
import { VerticalItem } from "../../../common/VerticalItem";
import { usePositionValue, useTradeDetails } from "../TradeDetailsInner";
import { useClose, useCloseAmounts } from "./useClose";

interface Props {
  modal: boolean;
}

export const Close: React.FC<Props> = ({ modal }: Props) => {
  const { address } = useAccount();
  const Beet = useBeet();

  const { setClose, quote, selectedLendgine, base } = useTradeDetails();

  const isInverse = isShortLendgine(selectedLendgine, base);

  const balanceQuery = useBalance(selectedLendgine.lendgine, address);

  const [input, setInput] = useState("");

  const symbol = quote.symbol + (isInverse ? "-" : "+");

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );

  const positionValue = usePositionValue(selectedLendgine);

  const { shares } = useCloseAmounts({
    amountOut: parsedAmount,
  });
  const close = useClose({ amountOut: parsedAmount });

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : // : parsedAmount && parsedAmount.equalTo(0)
        // ? "Enter more than zero"
        !parsedAmount
        ? "Invalid input"
        : !shares || !balanceQuery.data || balanceQuery.isLoading
        ? "Loading"
        : shares.greaterThan(balanceQuery.data)
        ? "Insufficient balance"
        : null,
    [balanceQuery.data, balanceQuery.isLoading, input, parsedAmount, shares]
  );

  return (
    <div tw="flex flex-col gap-4 w-full">
      {!modal && (
        <button onClick={() => setClose(false)} tw="items-center flex">
          <div tw="text-xs flex gap-1 items-center">
            <FaChevronLeft />
            Back
          </div>
        </button>
      )}
      <RowBetween tw="items-center p-0 ">
        <div tw="rounded-lg bg-secondary px-2 py-1 text-lg font-semibold">
          {symbol}
        </div>
        {positionValue ? (
          <VerticalItem
            label="Position value"
            item={
              <TokenAmountDisplay amount={positionValue} showSymbol tw="" />
            }
            tw="items-center"
          />
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
      <AssetSelection
        tw="border-2 border-[#2b2c34] rounded-lg "
        inputValue={input}
        selectedValue={selectedLendgine.token1}
        label={<span>Receive</span>}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount: positionValue,
          allowSelect: true,
          label: "Value",
        }}
      />
      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          await Beet(close);

          setInput("");
        }}
      >
        {disableReason ?? <p>Sell {symbol}</p>}
      </AsyncButton>
    </div>
  );
};
