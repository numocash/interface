import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useBalance } from "../../../../hooks/useBalance";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { About } from "./About";

export const Long: React.FC = () => {
  const environment = useEnvironment();
  const { address } = useAccount();

  const [input, setInput] = useState("");
  const balance = useBalance(environment.interface.wrappedNative, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, environment.interface.wrappedNative),
    [environment.interface.wrappedNative, input]
  );

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !balance.data
        ? "Loading"
        : parsedAmount.greaterThan(balance.data)
        ? "Insufficient balance"
        : null,
    [balance.data, input, parsedAmount]
  );

  return (
    <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] p-4 shadow flex flex-col gap-4 h-fit">
      <div tw="w-full justify-center flex">
        <div tw="bg-[#303030] items-center text-white w-36 flex justify-center py-2 rounded-xl relative  -top-9 font-semibold">
          Long
        </div>
      </div>
      <AssetSelection
        tw="border border-gray-200 rounded-lg mt-[-2rem]"
        label={<span>Deposit</span>}
        selectedValue={environment.interface.wrappedNative}
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
        onClick={() => {
          setInput("");
        }}
      >
        {disableReason ?? <p>Deposit</p>}
      </AsyncButton>
      <div tw="w-full border-gray-200 border-b my-4" />
      <About />
    </div>
  );
};
