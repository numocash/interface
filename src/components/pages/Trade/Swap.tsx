import React, { useMemo, useState } from "react";
import { FaArrowDown, FaPlus } from "react-icons/fa";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../hooks/useTokenBalance";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { Button } from "../../common/Button";
import { Settings } from "../../common/Settings";
import { ConfirmModal } from "./ConfirmModal";
import { Field, useSwapState } from "./useSwapState";

export const Swap: React.FC = () => {
  const { address } = useAccount();

  const [showModal, setShowModal] = useState(false);

  const {
    selectedFrom,
    selectedTo,

    invertSwap,
    onFieldInput,
    onFieldSelect,

    typedValue,

    swapDisabledReason,
    trade,
  } = useSwapState();

  const tokenAccounts = useMemo(
    () => [
      selectedFrom ?? null,
      selectedTo ?? null,
      trade?.market.pair.baseToken ?? null,
    ],
    [selectedFrom, selectedTo, trade?.market.pair.baseToken]
  );
  const balances = useTokenBalances(tokenAccounts, address);

  const baseAmount = trade?.market ? (
    <AssetSelection
      label={<span>To (Estimate)</span>}
      tw=""
      inputDisabled={true}
      selectedValue={trade.market.pair.baseToken}
      inputValue={trade?.baseAmount.toSignificant(6)}
      inputOnChange={(value) => onFieldInput(Field.Output, value)}
      currentAmount={{
        amount: balances && balances[2] ? balances[2] : undefined,
        allowSelect: false,
      }}
    />
  ) : null;

  return (
    <>
      <div tw="rounded-xl overflow-hidden bg-white shadow-2xl">
        <div tw="flex justify-between w-full bg-container h-[68px] py-3 px-6 items-center">
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
              label={<span>From</span>}
              onSelect={(value) => onFieldSelect(Field.Input, value)}
              selectedValue={selectedFrom}
              inputValue={typedValue}
              inputOnChange={(value) => onFieldInput(Field.Input, value)}
              currentAmount={{
                amount: balances && balances[0] ? balances[0] : undefined,
                allowSelect: true,
              }}
            />
            {trade && !trade.mint ? (
              <>
                <div tw="flex w-full justify-center mb-3">
                  <FaPlus tw="text-default justify-self-center" />
                </div>
                {baseAmount}
              </>
            ) : null}
            <Button onClick={invertSwap}>
              <div tw="flex w-full justify-center mb-3">
                <FaArrowDown tw="text-default justify-self-center" />
              </div>
            </Button>

            <AssetSelection
              label={<span>To (Estimate)</span>}
              tw=""
              inputDisabled={true}
              onSelect={(value) => onFieldSelect(Field.Output, value)}
              selectedValue={selectedTo}
              inputValue={trade?.outputAmount.toSignificant(6)}
              inputOnChange={(value) => onFieldInput(Field.Output, value)}
              currentAmount={{
                amount: balances && balances[1] ? balances[1] : undefined,
                allowSelect: false,
              }}
            />

            {trade && trade.mint ? (
              <>
                <div tw="flex w-full justify-center mb-3">
                  <FaPlus tw="text-default justify-self-center" />
                </div>
                {baseAmount}
              </>
            ) : null}
          </div>

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
