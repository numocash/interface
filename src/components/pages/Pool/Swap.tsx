import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useIsMarket } from "../../../contexts/environment";
import { useTokenBalances } from "../../../hooks/useTokenBalance";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { CenterSwitch } from "../../common/CenterSwitch";
import { Module } from "../../common/Module";
import { Settings } from "../../common/Settings";
import { ConfirmModal } from "./ConfirmModal";
import { Field, useSwapState } from "./useSwapState";

export const Swap: React.FC = () => {
  const { address } = useAccount();

  const [showModal, setShowModal] = useState(false);

  const {
    selectedFrom,
    selectedTo,
    parsedAmounts,

    invertSwap,
    onFieldInput,
    onFieldSelect,

    dependentField,
    independentField,
    typedValue,

    swapDisabledReason,
    trade,
  } = useSwapState();

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };
  const tokenAccounts = useMemo(
    () => [selectedFrom ?? null, selectedTo ?? null],
    [selectedFrom, selectedTo]
  );
  const balances = useTokenBalances(tokenAccounts, address);

  const fromMarket = useIsMarket(selectedFrom?.address ?? null);

  const toMarket = useIsMarket(selectedTo?.address ?? null);

  const mint = !fromMarket && toMarket;

  return (
    <>
      <Module tw="max-w-lg">
        {showModal ? (
          <ConfirmModal onDismiss={() => setShowModal(false)} />
        ) : null}
        <div tw="flex justify-between px-2">
          <div tw="flex text-default dark:text-default-d font-semibold">
            Swap
          </div>
          <Settings />
        </div>
        <div tw="mt-4 pb-0">
          <AssetSelection
            label={
              independentField === Field.Output ? (
                <span>From (Estimate)</span>
              ) : (
                <span>From</span>
              )
            }
            onSelect={(value) => onFieldSelect(Field.Input, value)}
            selectedValue={selectedFrom}
            inputValue={formattedAmounts[Field.Input] ?? ""}
            inputOnChange={(value) => onFieldInput(Field.Input, value)}
            currentAmount={{
              amount: balances && balances[0] ? balances[0] : undefined,
              allowSelect: true,
            }}
          />
          <CenterSwitch onClick={invertSwap} icon="arrow" />
          <AssetSelection
            label={
              independentField === Field.Input ? (
                <span>To (Estimate)</span>
              ) : (
                <span>To</span>
              )
            }
            inputDisabled={independentField === Field.Input}
            onSelect={(value) => onFieldSelect(Field.Output, value)}
            selectedValue={selectedTo}
            inputValue={formattedAmounts[Field.Output] ?? ""}
            inputOnChange={(value) => onFieldInput(Field.Output, value)}
            currentAmount={{
              amount: balances && balances[1] ? balances[1] : undefined,
              allowSelect: false,
            }}
          />
        </div>
        {/* {trade ? (
          <div tw="flex justify-between m-1 text-default dark:text-default-d">
            <div>Price</div>
            <TradePrice
              price={trade.executionPrice}
              showInverted={invertPrice}
              setShowInverted={setInvertPrice}
            />
          </div>
        ) : null} */}
        {mint ? (
          <div tw="flex w-full mt-1 justify-between text-default">
            <p>Bound</p>
            <p>2.5 CELO/cUSD</p>
          </div>
        ) : null}
        <AsyncButton
          variant="primary"
          tw="flex w-full text-xl h-16 p-0 mt-2"
          disabled={!!swapDisabledReason}
          onClick={() => setShowModal(true)}
        >
          {swapDisabledReason ?? "Swap"}
        </AsyncButton>
      </Module>
    </>
  );
};
