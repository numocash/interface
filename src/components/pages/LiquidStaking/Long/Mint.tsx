import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useBalance } from "../../../../hooks/useBalance";
import { useCurrentPrice } from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import { Beet } from "../../../../utils/beet";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { useBuy, useBuyAmounts } from "./useBuy";

export const Mint: React.FC = () => {
  const environment = useEnvironment();
  const { address } = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const lendgineInfo = useLendgine(lendgine);

  const [input, setInput] = useState("");
  const balance = useBalance(lendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, lendgine.token1),
    [input, lendgine.token1]
  );

  const priceQuery = useCurrentPrice([
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    environment.interface.liquidStaking!.lendgine.token0,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    environment.interface.liquidStaking!.lendgine.token1,
  ] as const);

  const { liquidity, shares } = useBuyAmounts({
    amountIn: parsedAmount,
    price: priceQuery.data,
  });
  const buy = useBuy({ amountIn: parsedAmount, price: priceQuery.data });

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !lendgineInfo.data || !balance.data
        ? "Loading"
        : parsedAmount.greaterThan(balance.data)
        ? "Insufficient balance"
        : lendgineInfo.data.totalLiquidity.equalTo(0)
        ? "Insufficient liquidity"
        : !liquidity || !shares || !buy.data
        ? "Loading"
        : liquidity.greaterThan(lendgineInfo.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      balance.data,
      buy.data,
      input,
      lendgineInfo.data,
      liquidity,
      parsedAmount,
      shares,
    ]
  );

  return (
    <>
      <AssetSelection
        tw="border border-gray-200 rounded-lg mt-[-2rem]"
        label={<span>Deposit</span>}
        selectedValue={
          environment.interface.liquidStaking?.lendgine.token1 ?? null
        }
        inputValue={input}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount: balance.data,
          allowSelect: true,
        }}
      />

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
        {disableReason ?? <p>Deposit</p>}
      </AsyncButton>
    </>
  );
};
