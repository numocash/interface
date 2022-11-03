import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../hooks/useTokenBalance";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { Module } from "../../common/Module";
import { Settings } from "../../common/Settings";
import { Field, useSwapState } from "./useSwapState";

export const Swap: React.FC = () => {
  const { address } = useAccount();

  const {
    selectedFrom,
    selectedTo,

    onFieldInput,
    onFieldSelect,

    typedValue,

    swapDisabledReason,
    trade,
    handleTrade,
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

  return (
    <>
      <Module tw="p-0">
        <div tw="flex justify-between w-full p-6 pb-0 items-center">
          <p tw=" font-semibold text-xl text-default">
            Trade perpetual options
          </p>
          <Settings />
        </div>
        <div tw="flex flex-col max-w-lg bg-amber-300 rounded-lg">
          <div tw=" pb-0 gap-2 flex flex-col p-6 bg-white">
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
          </div>
          <div tw="flex items-center justify-center self-center">
            <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px]  border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white w-0 " />
          </div>
          <div tw="flex flex-col gap-2 p-6 pt-2">
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
          </div>
        </div>
      </Module>
      <AsyncButton
        variant="primary"
        tw="flex w-full text-xl h-12 p-0"
        disabled={!!swapDisabledReason}
        onClick={async () => {
          await handleTrade();
          onFieldInput(Field.Input, "");
        }}
      >
        {swapDisabledReason ?? "Swap"}
      </AsyncButton>
    </>
  );
};
