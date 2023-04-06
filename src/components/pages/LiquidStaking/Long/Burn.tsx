import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useBalance } from "../../../../hooks/useBalance";
import { useMostLiquidMarket } from "../../../../hooks/useExternalExchange";
import { invert } from "../../../../lib/price";
import { Beet } from "../../../../utils/beet";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { useLongValue } from "../useValue";
import { useClose, useCloseAmounts } from "./useClose";

export const Burn: React.FC = () => {
  const environment = useEnvironment();
  const { address } = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;

  const [input, setInput] = useState("");

  const symbol = lendgine.token1.symbol + "+";

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, lendgine.token1),
    [input, lendgine.token1]
  );

  const userBalanceQuery = useBalance(lendgine.lendgine, address);
  const positionValue = useLongValue(userBalanceQuery.data);
  const currentPriceQuery = useMostLiquidMarket({
    base: lendgine.token1,
    quote: lendgine.token0,
  });

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
        : !shares ||
          !userBalanceQuery.data ||
          userBalanceQuery.isLoading ||
          !currentPriceQuery.data ||
          !close.data
        ? "Loading"
        : shares.greaterThan(userBalanceQuery.data)
        ? "Insufficient balance"
        : null,
    [
      input,
      parsedAmount,
      shares,
      userBalanceQuery.data,
      userBalanceQuery.isLoading,
      currentPriceQuery.data,
      close.data,
    ]
  );

  return (
    <>
      <AssetSelection
        tw="border border-gray-200 rounded-lg "
        inputValue={input}
        selectedValue={lendgine.token1}
        label={<span>Receive</span>}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount:
            currentPriceQuery.data && positionValue.value
              ? invert(currentPriceQuery.data.price).quote(positionValue.value)
              : undefined,
          allowSelect: true,
          label: "Value",
        }}
      />
      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(close.data);
          await Beet(close.data);

          setInput("");
        }}
      >
        {disableReason ?? <p>Sell {symbol}</p>}
      </AsyncButton>
    </>
  );
};
