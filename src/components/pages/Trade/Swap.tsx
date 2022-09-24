import React, { useMemo, useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import { useAccount } from "wagmi";

import { useIsMarket } from "../../../contexts/environment";
import { useTokenBalances } from "../../../hooks/useTokenBalance";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
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
      <div tw="rounded-xl overflow-hidden bg-white shadow-2xl">
        <div tw="flex justify-between w-full bg-container h-[68px] py-3 px-6 items-center justify-between">
          <p tw=" font-semibold text-xl text-default">
            Trade option perpetuals
          </p>
          <Settings />
        </div>
        <div tw="max-w-lg">
          {showModal ? (
            <ConfirmModal onDismiss={() => setShowModal(false)} />
          ) : null}

          <div tw=" pb-0 gap-2 flex flex-col  shadow-2xl bg-action p-6">
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
            {/* <CenterSwitch onClick={invertSwap} icon="arrow" /> */}
            <div tw="flex w-full justify-center mb-3">
              <FaArrowDown tw="text-default justify-self-center" />
            </div>
            <AssetSelection
              label={
                independentField === Field.Input ? (
                  <span>To (Estimate)</span>
                ) : (
                  <span>To</span>
                )
              }
              tw=""
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

          {/* <LongPayoff bound={trade?.market?.pair.bound ?? null} /> */}
        </div>
      </div>
      <AsyncButton
        variant="primary"
        tw="flex w-full text-xl h-12 p-0"
        disabled={!!swapDisabledReason}
        onClick={() => setShowModal(true)}
      >
        {swapDisabledReason ?? "Swap"}
      </AsyncButton>
    </>
  );
};
