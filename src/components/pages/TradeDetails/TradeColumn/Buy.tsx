import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { BuyStats } from "./BuyStats";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { useBuy, useBuyAmounts } from "./useBuy";
import { useBalance } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import { isLongLendgine } from "../../../../lib/lendgines";
import { Beet } from "../../../../utils/beet";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { useTradeDetails } from "../TradeDetailsInner";

export const Buy: React.FC = () => {
  const { quote, base, selectedLendgine } = useTradeDetails();
  const isLong = isLongLendgine(selectedLendgine, base);
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
        : !selectedLendgineInfo.data || !balance.data
        ? "Loading"
        : parsedAmount.greaterThan(balance.data)
        ? "Insufficient balance"
        : selectedLendgineInfo.data.totalLiquidity.equalTo(0)
        ? "Insufficient liquidity"
        : !liquidity || !shares || !buy.data
        ? "Loading"
        : liquidity.greaterThan(selectedLendgineInfo.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      balance.data,
      buy,
      input,
      liquidity,
      parsedAmount,
      selectedLendgineInfo.data,
      shares,
    ]
  );

  return (
    <>
      <AssetSelection
        tw="border border-gray-200 rounded-lg "
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
          invariant(buy.data);
          await Beet(buy.data);

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
      <ProvideLiquidity />
    </>
  );
};
