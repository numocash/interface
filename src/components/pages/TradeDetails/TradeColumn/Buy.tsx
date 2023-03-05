import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useBalance } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import { useBeet } from "../../../../utils/beet";
import { isLongLendgine } from "../../../../utils/lendgines";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { useTradeDetails } from "../TradeDetailsInner";
import { BuyStats } from "./BuyStats";
import { useBuy, useBuyAmounts } from "./useBuy";

export const Buy: React.FC = () => {
  const { quote, base, selectedLendgine } = useTradeDetails();
  const isLong = isLongLendgine(selectedLendgine, base);
  const Beet = useBeet();
  const { address } = useAccount();

  const selectedLendgineInfo = useLendgine(selectedLendgine);

  const [input, setInput] = useState("");
  const balance = useBalance(selectedLendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );
  const { liquidity, shares, bRate } = useBuyAmounts({
    amountIn: parsedAmount,
  });
  const buy = useBuy({ amountIn: parsedAmount });

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !selectedLendgineInfo.data
        ? "Loading"
        : selectedLendgineInfo.data.totalLiquidity.equalTo(0)
        ? "Insufficient liquidity"
        : !liquidity || !shares
        ? "Loading"
        : liquidity.greaterThan(selectedLendgineInfo.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [input, liquidity, parsedAmount, selectedLendgineInfo.data, shares]
  );

  return (
    <>
      <AssetSelection
        tw="border-2 border-stroke rounded-lg "
        label={<span>Pay</span>}
        selectedValue={selectedLendgine.token1}
        inputValue={input}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount: balance.data,
          allowSelect: true,
        }}
      />

      <BuyStats borrowRate={bRate ?? null} />

      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          await Beet(buy);

          setInput("");
        }}
      >
        {disableReason ?? (
          <p>
            Buy {quote.symbol}
            {isLong ? "+" : "-"}
          </p>
        )}
      </AsyncButton>
    </>
  );
};
