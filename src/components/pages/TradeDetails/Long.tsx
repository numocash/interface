import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import { useApprove } from "../../../hooks/useApproval";
import { useBalance } from "../../../hooks/useBalance";
import { useLendgine } from "../../../hooks/useLendgine";
import { useBeet } from "../../../utils/beet";
import { borrowRate } from "../../../utils/Numoen/jumprate";
import tryParseCurrencyAmount from "../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { useTradeDetails } from ".";
import { LongStats } from "./LongStats";

export const Long: React.FC = () => {
  const { other, lendgines } = useTradeDetails();
  const Beet = useBeet();
  const { address } = useAccount();
  const environment = useEnvironment();

  const longLendgines = useMemo(
    () => lendgines.filter((l) => l.token1.equals(other)),
    [lendgines, other]
  );

  // TODO: allow user to select
  const selectedLendgine = longLendgines[0];
  invariant(selectedLendgine);

  const selectedLendgineInfo = useLendgine(selectedLendgine);
  const bRate = useMemo(
    () =>
      selectedLendgineInfo.data ? borrowRate(selectedLendgineInfo.data) : null,
    [selectedLendgineInfo.data]
  );

  const [input, setInput] = useState("");
  const balance = useBalance(selectedLendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );
  const approve = useApprove(parsedAmount, environment.base.lendgineRouter);

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : null,
    [input, parsedAmount]
  );

  return (
    <>
      <AssetSelection
        tw="border-2 border-gray-200 rounded-lg "
        label={<span>Pay</span>}
        // onSelect={(value) => onFieldSelect(Field.Input, value)}
        selectedValue={other}
        inputValue={input}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount: balance.data,
          allowSelect: true,
        }}
      />

      <LongStats bound={selectedLendgine.bound} borrowRate={bRate} />

      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(parsedAmount);
          await Beet([
            {
              stageTitle: `Approve  ${parsedAmount?.toSignificant(5, {
                groupSeparator: ",",
              })}`,
              parallelTransactions: [
                {
                  title: `Approve  ${parsedAmount?.toSignificant(5, {
                    groupSeparator: ",",
                  })}`,
                  tx: {
                    prepare: approve.prepare as ReturnType<
                      typeof usePrepareContractWrite
                    >,
                    send: approve.write,
                  },
                },
              ],
            },
          ]);
        }}
      >
        {disableReason ?? <p>Buy {other.symbol}+</p>}
      </AsyncButton>
    </>
  );
};
